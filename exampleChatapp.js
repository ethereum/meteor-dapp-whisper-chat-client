//web3.setProvider(new web3.providers.HttpRpcProvider("http://localhost:8080"));

function def(a, b) { return a ? a : b; }

/*

var myIdentity = db.get("chat", "identity");
if (!+web3.toDecimal(myIdentity) || !shh.haveIdentity(myIdentity))
{
    myIdentity = shh.newIdentity();
    db.put("chat", "identity", myIdentity);
}
*/
var shh = web3.shh;
var db = web3.db;

var myIdentity;
var myIdPromise = db.get('chat', 'identity').then(function (res) {
    return shh.haveIdentity(res).then(function (have) {
        if (!have) {
            return shh.newIdentity().then(function (newId) {
                db.put('chat', 'identity', newId);
                return newId;
            });
        }
        return res;
    });
}).then(function (id) {
    myIdentity = id;
    return id;
}).catch(function (err) {

});

var name;
var room;

var names = {};
var invNames = {};

var onMessage;
var onPrivateMessage;
var lastNameSend;

function newMessage(ms)
{
    ms.forEach(function (m) {
        document.getElementById('log').innerHTML = document.getElementById('log').innerHTML +
            '<div class="' + (+web3.toDecimal(m.to) ? "private" : "room") + '"><span class="timestamp">[' + new Date(m.sent * 1000).toLocaleTimeString() + ']</span> ' +
            '<span class="who">' + (names[m.from] ? names[m.from] : m.from.substr(2, 8)) + '</span>' +
            (+web3.toDecimal(m.to) ?
                ' -> <span class="me">' + name + '</span>: ' :
                ': ') +
            '<span class="message">' + web3.toAscii(m.payload) + '</span></div>';
        document.getElementById('log').scrollTop = '1500000';
    });
}

var newName = function(ms)
{
    ms.forEach(function (m) {
        if (names[m.from])
            delete invNames[names[m.from]];
        names[m.from] = web3.toAscii(m.payload, 0);
        invNames[names[m.from]] = m.from;
    });
}

function nameChanged()
{
    if (name != document.getElementById('name').value.replace(' ', '_') || !lastNameSend || new Date - lastNameSend > 60000)
    {
        name = document.getElementById('name').value.replace(' ', '_');
        db.putString("chat", "name", name);
        shh.post({ from: myIdentity, topic: [web3.fromAscii('chat'), web3.fromAscii('namechange')], payload: web3.fromAscii(name, 0), ttl: 60 });
        lastNameSend = new Date;
    }
}

function roomChanged()
{
    if (onMessage)
        onMessage.uninstall();
    room = document.getElementById('room').value;
    db.putString("chat", "room", room);
    onMessage = shh.watch({ 'topic': [web3.fromAscii('chat'), web3.fromAscii(room)] });
    onMessage.arrived(newMessage);
}

function post()
{
    nameChanged();
    var txt = document.getElementById('entry').value;
    var pm = /^\$([^ ]+):? ?(.*)$/.exec(txt);
    var msg = { from: myIdentity };
    if (pm && invNames[pm[1]])
    {
        msg.to = invNames[pm[1]];
        txt = pm[2];
        msg.topic = [web3.fromAscii('chat'), msg.to];
    }
    else
        msg.topic = [web3.fromAscii('chat'), web3.fromAscii(room)];
    msg.payload = web3.fromAscii(txt, 0);
    shh.post(msg);
    document.getElementById('entry').value = "";
}

function tab(at)
{
    var txt = document.getElementById('entry').value;
    var m = /^([@\$])([^ ]+)$/.exec(txt.substr(0, at));
    if (m)
        for (var n in names)
            if (names[n].substr(0, m[2].length) == m[2])
            {
                document.getElementById('entry').value = txt.substr(0, at - m[2].length) + names[n] + " " + txt.substr(at);
                return true;
            }
    return false;
}

document.getElementById('name').onkeydown = function(event)
{
    if (event.keyCode == 13)
        nameChanged();
}

document.getElementById('room').onkeydown = function(event)
{
    if (event.keyCode == 13)
        roomChanged();
}

document.getElementById('entry').onkeydown = function(event)
{
    if (event.keyCode == 13)
        post();
    else if (event.keyCode == 9 || event.keyCode == 16)
        if (tab(document.getElementById('entry').selectionEnd))
            return false;
    return true;
}

var pmWatch = shh.watch({ 'topic': [web3.fromAscii('chat'), myIdPromise], 'to': myIdPromise });
pmWatch.arrived(function(f) { newMessage(f); });
var nameChangeWatch = shh.watch({ 'topic': [web3.fromAscii('chat'), web3.fromAscii('namechange')] });
nameChangeWatch.arrived(newName);

db.getString('chat', 'room').then(function (res) {
    document.getElementById('room').value = res;
    roomChanged();
});

myIdPromise.then(function() {
    db.getString('chat', 'name').then(function (res) {
        document.getElementById('name').value = res;
        nameChanged();
    });
});