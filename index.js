//modules
var inbox = require('inbox'),
    five = require("johnny-five"),
    growl = require('growl'),
//vars
    appName = process.env.APPNAME || 'GMailDuino',
//hardware parts
    board = new five.Board(),
    notify = true, //toggled by the button on the board
    button,
    led;

/*
 * when the board is ready we can assign the button and the led 
 * to the equivalent hardware parts on the board 
 * */
console.log( process.env.USERNAME, process.env.PASSWORD );

board.on('ready', function(){
    registerHardware();
});

function registerHardware(){
    button = new five.Button(2);
    led = new five.Led(12);

    button.on('down', toggleNotifications);
}
function toggleNotifications(){
    notify = !notify;
    showNotification('notifications: ' + (notify ? 'on' : 'off'));
}
function showNotification( msg ){
    growl(msg, { title: appName });
}

var client = inbox.createConnection(false, 'imap.gmail.com', {
	secureConnection: true,
	auth:{
		user: process.env.USERNAME,
		pass: process.env.PASSWORD
	}
});


client.connect();

client.on('new', newMessage);

client.on('connect', function(){
    client.openMailbox('INBOX', function(err, info){
        if( err ) {
            throw err;
        }
        console.log( 'successfully connected to INBOX:gmail'  );
    })
});

function newMessage( message ){
    if( notify ){
        showNotification( 'New mail from <' + message.from.address  + '>' );
        if( board.ready ){
            led.strobe(100);
            board.wait( 4000, function(){
                led.off();
            })
        }
    }
}
