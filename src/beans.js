const jackd = require('jackd');

module.exports = function(RED) {
    
    const jackd = require('jackd');
   
    /* Config */
    function BeanstalkdServerNode(config) {
        RED.nodes.createNode(this,config);
    }
    RED.nodes.registerType("beanstalkd_server",BeanstalkdServerNode);
    

    /* Put */
    function BeanstalkdPutNode(config) {
        RED.nodes.createNode(this,config);


        const node = this;
        let server = new jackd();
        try{
            server.connect().then(()=>{
                node.status({
                    fill: "blue",
                    shape: "dot",
                    text: `Connected`,
                });    
            });
        } catch (err){
            node.status({
                fill: "red",
                shape: "dot",
                text: `${err.message}`,
            });

            node.error(err);
        }

        node.on('input', function(msg,send,done) {
            let tube = msg.job.tube || config.tube;
            
            let put_options = {
                priority: msg.job.priority || config.priority || 0,
                delay: msg.job.delay || config.delay || 0,
                ttr: msg.job.ttr || config.ttr || 0,
            } 
            
            server.use(tube)
            .then(()=>{
                node.debug(`Using tube ${tube}`)
                server.put(msg.job.payload,put_options)
                .then ( (result) => {

                    msg.job.id = result

                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: `Last: ${result}@${tube}`,
                    });                
    
                    send(msg);
                })
                .catch( e => {
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: `${e.message}`,
                    });
                    node.error(e);
                });   
            });

            if (done) { 
                done();
            }    
        });

    }
    RED.nodes.registerType("put",BeanstalkdPutNode);

    /* Reserve tube */
    function BeanstalkdReserveTubeNode(config) {

        RED.nodes.createNode(this,config);

        const node = this;
        
        node.status({
            fill: "blue",
            shape: "dot",
            text: `Booting`,
        });

        let reserving = true;
        let last = null

        node.status({
            fill: "blue",
            shape: "dot",
            text: 'Booting',
        }); 

        const reserveJob = () => {
            if (!reserving) return;

            let msg = {
                server:new jackd()
            }

            msg.server.connect()
            .then(()=>{
                node.debug("Connected");
              
                let tube = config.tube; 
                msg.server.watch(tube)
                .then(()=>{
                    if (tube != 'default') {
                        msg.server.ignore('default')
                        .then(()=>{
                            node.debug('ignored default tube');
                        });
                    }
                })
                .then(()=>{
                    node.status({
                        fill: "blue",
                        shape: "dot",
                        text: `Watching (last:${last})`,
                    }); 
                    msg.server.reserve()
                    .then((result) =>{
                        msg.job = {
                            id:result.id, 
                            payload:result.payload.toString()
                        };
    
                        last = msg.job.id;
    
                        node.log(`Reserved ${msg.job.id} ${msg.job.payload}`);
                        node.status({
                            fill: "green",
                            shape: "dot",
                            text: `Reserved ${msg.job.id}`,
                        }); 
    
                        node.send(msg);
    
                        reserveJob();
                    });                        
                });
            });
        };

        reserveJob();
        
        node.on('close',()=>{
            reserving = false;
        })

    }
    RED.nodes.registerType("reserve tube",BeanstalkdReserveTubeNode);


    /* Reserve job */
    function BeanstalkdReserveJobNode(config) {

        RED.nodes.createNode(this,config);

        const node = this;

        node.status({
            fill: "blue",
            shape: "dot",
            text: 'Ready',
        }); 

        node.on('input', function(msg,send,done) {
            
            msg.server = new jackd();
            msg.server.connect();
            node.status({
                fill: "blue",
                shape: "dot",
                text: 'Connected',
            }); 
            
            msg.server.reserveJob(msg.job.id)
            .then ( (result) => {
                node.status({
                    fill: "green",
                    shape: "dot",
                    text: `Last: ${msg.job.id}`,
                });                

                msg.job.payload = result.payload.toString();

                send([msg,null]);
            })
            .catch( e => {
                node.error(e);

                msg.error = e.response;

                node.status({
                    fill: "red",
                    shape: "dot",
                    text: `${msg.jobid} ${e.response}`,
                });
                send([null, msg]);
            });   
            
            if (done) { 
                done();
            }    
        });        
    }
    RED.nodes.registerType("reserve job",BeanstalkdReserveJobNode);


    /* Delete */
    function BeanstalkdDeleteNode(config) {
        RED.nodes.createNode(this,config);

        const node = this;

        node.status({
            fill: "blue",
            shape: "dot",
            text: `Ready`,
        });                  

        node.on(
            'input', 
            function(msg,send,done) {
                node.debug("Starting to delete",msg.job.id);
                node.status({
                    fill: "green",
                    shape: "dot",
                    text: `Starting to delete ${msg.job.id}`,
                });                  
                
                msg.server.delete(msg.job.id)
                .then ( () => { // jackd.delete does not return result
                    node.debug("I've deleted",msg.job.id);
                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: `Last ${msg.job.id}`,
                    });                
                    send([msg,null]);
                })
                .catch( e => {
                    node.error(`Error at delete ${e.message}`);
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: `${e.message}`,
                    });
                    msg.error = e;
                    send([null,msg]);
                })
                .finally(()=>{
                    msg.server.disconnect(); // Free up connection. 
                })
                ;

                if (done) { 
                    done();
                }        
            }
        );

    }
    RED.nodes.registerType("delete",BeanstalkdDeleteNode);


    /* Release */
    function BeanstalkdReleaseNode(config) {
        RED.nodes.createNode(this,config);

        const node = this;
        node.status({
            fill: "blue",
            shape: "dot",
            text: `Ready`,
        });                  

        node.on(
            'input', 
            function(msg,send,done) {
                node.debug("Starting to release",msg.job.id);
                node.status({
                    fill: "green",
                    shape: "dot",
                    text: `Starting to release ${msg.job.id}`,
                });                  

                let release_options={
                    priority: msg.job.priority || config.priority || 0,                    
                    delay : msg.job.delay || config.delay || 0
                };

                msg.server.release(msg.job.id,release_options)
                .then ( () => {
                    node.debug(`I've 
                    released ${msg.job.id}`);
                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: `Last released ${msg.job.id}`,
                    });                
                    send([msg,null]);
                })
                .catch( e => {
                    node.error(`Error at release : ${e.message}`);
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: `${e.message}`,
                    });
                    send([null,{error:e.message}]);
                })
                .finally(()=>{
                    //msg.server.disconnect(); // Free up connection, if you are sure this will be the last node
                });

                if (done) { 
                    done();
                }
        
            }
        );
    }
    RED.nodes.registerType("release",BeanstalkdReleaseNode);


    /* Bury */
    function BeanstalkdBuryNode(config) {
        RED.nodes.createNode(this,config);

        const node = this;
        node.status({
            fill: "blue",
            shape: "dot",
            text: `Ready`,
        });                  

        node.on(
            'input', 
            function(msg,send,done) {
                node.debug("Starting to burry",msg.job.id);
                node.status({
                    fill: "green",
                    shape: "dot",
                    text: `Starting to burry ${msg.job.id}`,
                });   
                let priority = msg.job.priority || config.priority || 0; 

                msg.server.bury(msg.job.id, priority)
                .then ( () => {
                    node.log(`I've burried ${msg.job.id}`);
                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: `Last burried ${msg.job.id}`,
                    });                
                    send([msg,null]);
                })
                .catch( e => {
                    node.error(`Error at burry : ${e.message}`);
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: `${e.message}`,
                    });
                    send([null,{error:e.message}]);
                })
                .finally(()=>{
                    //msg.server.disconnect(); // Free up connection, if you are sure this will be the last node
                })
                ;

                if (done) { 
                    done();
                }
        
            }
        );
    }
    RED.nodes.registerType("bury",BeanstalkdBuryNode);


    /* Kick job */
    function BeanstalkdKickJobNode(config) {
        RED.nodes.createNode(this,config);

        const node = this;
        node.status({
            fill: "blue",
            shape: "dot",
            text: `Ready`,
        });                  

        node.on(
            'input', 
            function(msg,send,done) {
                node.debug(`Starting to kick job ${msg.job.id}`,);
                node.status({
                    fill: "green",
                    shape: "dot",
                    text: `Starting to kick job ${msg.job.id}`,
                });                  

                msg.server.kickJob(msg.job.id)
                .then ( () => {
                    node.debug(`I've kicked job ${msg.job.id}`);
                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: `Last kicked ${msg.job.id}`,
                    });                
                    send([msg,null]);
                })
                .catch( e => {
                    node.error(`Error at kick job : ${e.message}`);
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: `${e.message}`,
                    });
                    send([null,{error:e.message}]);
                })
                .finally(()=>{
                    //msg.server.disconnect(); // Free up connection, if you are sure this will be the last node
                })
                ;

                if (done) { 
                    done();
                }
        
            }
        );
    }
    RED.nodes.registerType("kick job",BeanstalkdKickJobNode);

}