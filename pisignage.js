/*module.exports = function(RED) {
    function LowerCaseNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });
    }
    RED.nodes.registerType("lower-case",LowerCaseNode);
}*/

module.exports = function (RED) {
    function pisignageNodeCreds(config) {
        RED.nodes.createNode(this, config);
        this.username = config.username;
        this.password = config.password;
        this.host = config.host;
        this.token = "INVALID TOKEN";

        const raw = JSON.stringify({
            "email": this.username,
            "password": this.password,
            "getToken": true,
        });

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };


        (async () => {
            try {
                const rec = await fetch(this.host + '/api/session', requestOptions);
                if (!rec.ok) {
                    throw new Error('Network response was not ok ' + rec.statusText);
                }

                const data = await rec.json();
                this.token = data['token'];
                //console.log(data);
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        })();



    }
    RED.nodes.registerType("pisignage-creds", pisignageNodeCreds);

    function pisignageNode(config) {
        RED.nodes.createNode(this, config);
        this.creds = RED.nodes.getNode(config.creds);
        var node = this;
        node.on('input', function (msg) {
            //console.log(this.creds.token);



        });
    }
    RED.nodes.registerType("pisignage", pisignageNode);

    function pisignagePowerNode(config) {
        RED.nodes.createNode(this, config);
        this.creds = RED.nodes.getNode(config.creds);
        this.playerName = config.playerName;
        this.playerID = "";
        var node = this;
        let editedPlayerName = this.playerName.replaceAll(' ', '%20');
        //console.log(this.playerName);

        

        node.on('input', async function (msg) {
            console.log(msg.payload.powerState);
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            };

            //console.log(editedPlayerName);
            try {
                const rec = await fetch(this.creds.host + '/api/players?string=' + editedPlayerName + '&token=' + this.creds.token, requestOptions);

                if (!rec.ok) {
                    throw new Error('Network response was not ok ' + rec.statusText);
                }

                const data = await rec.json();
                console.log(data);

                this.playerID = data['data']['objects'][0]['_id'];
                console.log(this.playerID);
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
            if (msg.payload.powerState == 'on') {
                var turnTVOn = false;
            } else if (msg.payload.powerState == 'off'){
                var turnTVOn = true;
            }

                const raw = JSON.stringify({
                    "status": turnTVOn
                });

                newrequestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw
                    };
                
                try {
                    
                    const rec = await fetch(this.creds.host + '/api/pitv/'+this.playerID+'?token='+this.creds.token, newrequestOptions);
                    if (!rec.ok) {
                        throw new Error('Network response was not ok ' + rec.statusText);
                    }
                    const data = await rec.json();
                    console.log(data);

                }
                catch (error) {
                    console.error('There was a problem with the fetch operation:', error);
                }
            

        });
    }
    RED.nodes.registerType("pisignage-tv-power", pisignagePowerNode);
}