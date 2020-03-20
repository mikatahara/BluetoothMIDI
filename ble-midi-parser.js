/**
 * The parser of MIDI of Bluetooth LE
 * for Note.js
 * It needs two modules, "noble" and "bleno"
 * (c) 2014-2018 Mikatahara All Right Reserved
 * 21, Nov. 2018 First Upload
 */
module.exports = {
  create: BLEMIDIParser,
}

function BLEMIDIParser(){  return{

	mStatus:[],			//Keep status for running status
	mChanne:[],			//Keep channel number for running status
	mOutData:[],		//Output MIDI Data from this function

	mInByte: undefined,		//Input Data Bytes from BLE-MIDI
	mOutByte:undefined,		//Output MIDI Data Bytes
	mPtimestamp:undefined,	//Packet timestamp
	mEventnum:undefined,	//Output MIDI events number
	mTimestamp:[],			//Timestamp for Each MIDI events

	fParse : function( cdata ){
		var icount =0;

		this.mInByte = cdata.length;	//Byte of Input
		this.mOutByte = 0;				//Output Counter Reset
		this.mOutData = [];				//Clear Output Data
		this.mEventnum= 0;				//Event Number
		this.mTimestamp =[];			//Clear Each MIDI event Timestamp

		if( !(cdata[0]&0x80) ){ 		//Check MSB of First byte
			console.log("MSB of first byte is not set");
			return;
		}

		if( !(cdata[1]&0x80) ){ 		//Check MSB of Second byte
			console.log("MSB of second byte is not set");
			return;
		}

		// Timestamp of this packet
		this.mPtimestamp = (cdata[icount]&0x3F)<<7;	icount++;

		while(icount<this.mInByte){

		if( cdata[icount]&0x80 ){		//Each Timestamp
			this.mTimestamp[this.mEventnum] = cdata[icount]&0x7F; icount++;

			if( cdata[icount]&0x80 ){		//This byte is status
				this.mStatus = cdata[icount]&0xF0;
				this.mChannel = cdata[icount]&0x0F;
				icount++;
			} else {
				//It's running status
			}

		} else {	//There is not a timesamp
			this.mTimestamp[this.mEventnum] = 0;
			// It's running status
		}

		this.mEventnum++;

		switch( this.mStatus ){
			case 0x80:		//Note Off	2byte
			case 0x90:		//Note On	2byte
			case 0xA0:		//Polyphonic Key Pressure	2byte
			case 0xB0:		//Control Change	2byte
			case 0xE0:		//Pitch Bend	2byte
				this.mOutData[this.mOutByte]=this.mStatus+this.mChannel; this.mOutByte++;
				this.mOutData[this.mOutByte]=cdata[icount]; this.mOutByte++; icount++;
				this.mOutData[this.mOutByte]=cdata[icount]; this.mOutByte++; icount++;
				break;

			case 0xC0:		//Program Change	1byte
			case 0xD0:		//Channel Pressure	1byte
				this.mOutData[this.mOutByte]=this.mStatus+this.mChannel; this.mOutByte++;
				this.mOutData[this.mOutByte]=cdata[icount]; this.mOutByte++; icount++;
				break;

			case 0xF0:	// System Exclusive
				console.log("SysEx:", cdata[icount]); icount++;
				break;
		}

		} //end of while
	},

}};
