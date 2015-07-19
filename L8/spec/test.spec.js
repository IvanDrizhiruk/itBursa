var request = require('supertest');
var app;

var user1 = {id: '1', name: 'Illya Klymov', phone: '+380504020799', role: 'Administrator'};
var user2 = {id: '2', name: 'Ivanov Ivan', phone: '+380670000002', role: 'Student', strikes: 1};
var user3 = {id: '3', name: 'Petrov Petr', phone: '+380670000001', role: 'Support', location: 'Kiev'};
var users = [user1, user2, user3];


function resetApp() {
    delete require.cache[require.resolve('../index')];
    app = require('../index');
}


describe('GET /refreshAdmins', function(){
    beforeEach(function(){
        resetApp();
    });

    it('should return 200 for json', function(done){
        request(app)
            .get('/refreshAdmins')
            .set('Content-Type', 'application/json')
            //.expect('Content-Type', /json/)
            .expect(200, done);
    });
});

describe('Start server state', function(){
    beforeEach(function(){
        resetApp();
    });

    it('should return 3 users', function(done){
        request(app)
            .get('/api/users')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(JSON.stringify(users))
            .expect(200, done);
    });
});



describe('POST', function(){
    beforeEach(function(){
        resetApp();
    });

    it('new admin should be added', function(done){
        //TODO ISD
        var adminUser = {id: 4, name: 'Ivan', phone: '+378979879887', role: 'Administrator' };

        request(app)
            .post('/api/users')
            .send(JSON.stringify(adminUser))
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, done);

        request(app)
            .get('/api/users')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(JSON.stringify([user1, user2, user3, adminUser]))
            .expect(200, done);
    });

    it('new student should be added if role empty', function(done){
        var studentUserNoRole = {id: 4, name: 'Student', phone: '+380670000002', strikes: 1};
        var studentUser       = {id: 4, name: 'Student', phone: '+380670000002', strikes: 1, role: 'Student'};

        request(app)
            .post('/api/users')
            .send(JSON.stringify(studentUserNoRole))
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, done);

        request(app)
            .get('/api/users')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(JSON.stringify([user1, user2, user3, studentUser]))
            .expect(200, done);
    });
});

describe('PUT', function(){
    beforeEach(function(){
        resetApp();
    });

    it('admin should be updated', function(done){
        var user1Updated  = {id: '1', name: 'Illya Klymov', phone: '+380504020799', role: 'Administrator'};
        request(app)
            //TODO ISD
            .put('/api/users')
            .send(JSON.stringify(user1Updated))
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, done);

        request(app)
            .get('/api/users')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(JSON.stringify([user1Updated, user2, user3]))
            .expect(200, done);
    });

    it('student should be updated if role empty', function(done){
        var user2Before = {id: '2', name: 'Student', phone: '+380670000002', role: 'Student', strikes: 2};
        var user2After = {id: '2', name: 'Student', phone: '+380670000002', role: 'Student', strikes: 2};

        request(app)
            //TODO ISD .put('/api/users/2')
            .put('/api/users')
            .send(JSON.stringify(user2Before))
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, done);

        request(app)
            .get('/api/users')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(JSON.stringify([user1, user2After, user3]))
            .expect(200, done);
    });
});



describe('No Content-Type header', function(){
    beforeEach(function(){
        resetApp();
    });

    it('get should return 401 for notempty Content-Type', function(done){
        request(app)
            .get('/api/users')
            .expect('Content-Type', /json/)
            .expect(401, done);
    });

    it('post should return 401 for notempty Content-Type', function(done){
        request(app)
            .post('/api/users')
            .send('test message')
            .expect('Content-Type', /json/)
            .expect(401, done);
    });
});