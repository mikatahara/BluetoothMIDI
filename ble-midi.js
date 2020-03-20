/**
 * The Connection of MIDI of Bluetooth LE
 * for Note.js
 * It needs two modules, "noble" and "bleno"
 * (c) 2014-2018 Mikatahara All Right Reserved
 * 21, Nov. 2018 First Upload
 */
 
// Using the bleno module
var bleno = require('bleno');
var blemidiparser = require('./ble-midi-parser.js');

var data = [0xFF, 0xFF, 0x80, 0x60, 0x7F, 0xF0, 0x81, 0x61, 0x7E, 0x62, 0x7D, 0xE0, 0x90, 0x10, 0x20, 0xC0, 0xC0, 0x00, 0x02];
var data2 = [0xFF, 0xF0, 0x81, 0x61, 0x7E, 0x62, 0x7D];

	cparser = blemidiparser.create();

/*	cparser.fParse( data );
	console.log(cparser.mInByte);
	console.log(cparser.mPtimestamp);
	console.log(cparser.mTimestamp);
	console.log(cparser.mOutData);

	cparser.fParse( data2 );
	console.log(cparser.mInByte);
	console.log(cparser.mPtimestamp);
	console.log(cparser.mTimestamp);
	console.log(cparser.mOutData);
*/

var BLEMIDI_SERVICE_UUID = '03B80E5AEDE84B33A7516CE34EC4C700';
var BLEMIDI_DATAIO_UUID  = '7772E5DB38684112A1A9F2669D106BF3';
var BLEMIDI_BASEREV_UUID = '00C7C44EE36C51A7334BE8ED5A0EB803'

	var funcUpdateValueCallback=null;
	var mCount=0;
/*	var ivel=0;
	var intervalId = setInterval(function() {
		if(funcUpdateValueCallback!=null){
			console.log("*");
			funcUpdateValueCallback(new Buffer([0x80,0x80,0x91,ivel,0x7F]));
			ivel++;
			ivel&=0x7F;
		}
	}, 1000);
*/

// Once bleno starts, begin advertising our BLE address
bleno.on('stateChange', function(state) {
    console.log('State change: ' + state);
    if (state === 'poweredOn') {
        bleno.startAdvertising('MyBLEDevice',[BLEMIDI_SERVICE_UUID]);
    } else {
        bleno.stopAdvertising();
    }
});

// Notify the console that we've accepted a connection
bleno.on('accept', function(clientAddress) {
    console.log("Accepted connection from address: " + clientAddress);

});
 
// Notify the console that we have disconnected from a client
bleno.on('disconnect', function(clientAddress) {
    console.log("Disconnected from address: " + clientAddress);
});

// When we begin advertising, create a new service and characteristic
//bleno.on('accept', function(clientAddress) {
bleno.on('advertisingStart', function(error) {

//	var error=0;
    if (error) {
        console.log("Advertising start error:" + error);
    } else {
        console.log("Advertising start success");
  
        bleno.setServices([

            // Define a new service
            new bleno.PrimaryService({
                uuid : BLEMIDI_SERVICE_UUID,
                characteristics : [
                    
                    // Define a new characteristic within that service
                    new bleno.Characteristic({
                        value : null,
                        uuid : BLEMIDI_DATAIO_UUID,
                        properties : ['notify', 'read', 'write', 'indicate', 'writeWithoutResponse' ],

                        // If the client subscribes, we send out a message every 1 second
						onSubscribe : function(maxValueSize, updateValueCallback) {
							console.log("Device subscribed "+maxValueSize);
							if(funcUpdateValueCallback!=null) console.log("error!!");
							funcUpdateValueCallback = updateValueCallback;
                        },
                        
						// If the client unsubscribes, we stop broadcasting the message
						onUnsubscribe : function() {
							console.log("Device unsubscribed");
							funcUpdateValueCallback=null;
                        },

                        // Send a message back to the client with the characteristic's value
						onNotify : function(){
 /*           				console.log('onNotify');	//to show when notification is being sent
							if(this.value){ console.log("value.length= " + this.value.length);
							console.log(this.value); }*/
        				},

						// Send a message back to the client with the characteristic's value
                        onReadRequest : function(offset, callback) {
							console.log("Read request received " +offset);
							callback(this.RESULT_SUCCESS,new Buffer([]));
                        },

						 // Accept a new value for the characterstic's value
						onWriteRequest : function(data, offset, withoutResponse, callback) {
							this.value = data;
							cparser.fParse( this.value );
							console.log("TS", cparser.mTimestamp);
							console.log("DT", cparser.mOutData);
							if(funcUpdateValueCallback!=null){
								funcUpdateValueCallback(this.value);
							}
/*
							console.log('Write request: value = ' + this.value.length );
							switch(this.value.length){
								case 5:
									console.log("0x" + this.value[0].toString(16)
										+ ":0x" + this.value[1].toString(16)
										+ ":0x" + this.value[2].toString(16)
										+ ":0x" + this.value[3].toString(16)
										+ ":0x" + this.value[4].toString(16)
										);
									break;
								case 4:
									console.log("0x" + this.value[0].toString(16)
										+ ":0x" + this.value[1].toString(16)
										+ ":0x" + this.value[2].toString(16)
										+ ":0x" + this.value[3].toString(16)
										);
									break;
								default:
									for(var i=0; i<this.value.length; i++) console.log("0x" + this.value[i].toString(16));
									break;
							}
*/
                            callback(this.RESULT_SUCCESS);
                        },

						onIndicate : function(){
                            console.log("Indicate request received");
						},

                    })
                    
                ]
            })
        ]);
    }
});

