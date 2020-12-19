const BASE_URL = "http://localhost:5000/"

export default class ApiService {
    getTest() {
        return fetch(BASE_URL + 'api');
    }

    // user : {username: '', password: ''}
    login(user) {
        return fetch(BASE_URL + 'api/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify( {username: user.username, password: user.password} )
        });
    }

    // user : {username: '', password: '', firstname: ''}
    createUser(user) {
        return fetch(BASE_URL + 'api/users', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( {username: user.username, password: user.password, firstname: user.firstname} )
        })
    }

    // token : string
    getCurrentUser(token) {
        return fetch(BASE_URL + 'api/users', {
            method: 'GET',
            headers: { 'x-access-token': token }
        });
    }

    // token : string
    getCurrentUserTranscript(token) {
        return fetch(BASE_URL + 'api/users/transcript', {
            method: 'GET',
            headers: { 'x-access-token': token }
        });
    }

    // token : string, transcript : []
    updateCurrentUserTranscript(token, transcript) {
        return fetch(BASE_URL + '/api/users/transcript', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': token 
            },
            body: JSON.stringify( { 'transcript': transcript } )
        });
    }
};

