var noble = require('noble');

noble.on('stateChange', function(state) {
    console.log(state);
    if (state === 'poweredOn') noble.startScanning();
//'unknown' 'resetting' 'unsupported' 'unauthorized' 'poweredOff'
    else noble.stopScanning();
});

noble.on('scanStart', function() {
    console.log('*** scanStart');
});

noble.on('scanStop', function() {
    console.log('*** scanStop');
});

noble.on('discover', function(peripheral){
	console.log('*** Discover');
    noble.stopScanning();		//stop scanning
	peripheral.connect();		//connect to the device

	// Connect
	peripheral.on('connect', function() {
		console.log('*** Connect');
		this.discoverServices();
	});

	// Disconnect
	peripheral.on('disconnect', function() {
		console.log('*** Disconnect');
	});
 
	// Access to the device
	peripheral.on('servicesDiscover', function(services) {
		console.log('*** Services length ' + services.length);
		for(var i=0; i<services.length; i++) {
 			console.log('uuid ['+i+'] = '+services[i]['uuid']);
		}
	});

});
