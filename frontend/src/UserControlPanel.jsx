import React, { useState } from 'react'

import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button';

/* UseControlCard
 * States:
 *  - componentState = 'welcome', 'loggedIn', 'createAcct'
 */
const UserControlCard = ({apiservice, user, login, signOut, refresh, save}) => {
    const [componentState, setComponentState] = useState('welcome');
    const [formUser, setFormUser] = useState( {username: '', password: '', firstname: ''} );
    const [error, setError] = useState('');

    /* 'welcome' Functions */
    const handleSignInSubmit = e => {
        e.preventDefault();

        if (!formUser.username || formUser.username === "test" || !formUser.password || formUser.password.length > 64) {
            setError('Username or password is invalid');
            return;
        }

        apiservice.login( {username: formUser.username, password: formUser.password} ).then(response => response.json()).then(value => {
            const token = value['token'];
            login(token);
            setError('');
            setComponentState('loggedIn');
        }).catch(err => {
            console.log('Error in user login: User does not exist, password is incorrect, or backend is offline. Error: ' + err);
            setError('Username or password is invalid');
        });
    }

    const handleGoToCreateAcct = e => {
        e.preventDefault();
        setFormUser( {username: '', password: '', firstname: ''} );
        setError('');
        setComponentState('createAcct');
    }

    /* 'loggedIn' Functions */
    const handleSignOutSubmit = e => {
        e.preventDefault();
        setFormUser( {username: '', password: '', firstname: ''} );
        setError('');
        signOut();
        setComponentState('welcome');
    }

    const handleRefresh = e => {
        e.preventDefault();
        refresh();
    }

    const handleSave = e => {
        e.preventDefault();
        save();
    }

    /* 'createAcct' Functions */
    const handleCancelCreateAcct = e => {
        e.preventDefault();
        setError('');
        setComponentState('welcome');
    }

    const handleCreateAcct = e => {
        e.preventDefault();

        if (!(formUser.username || formUser.password || formUser.firstname)) return;

        apiservice.createUser(formUser).then(response => response.json()).then(value => {
            console.log(value.message);
            setFormUser( {username: formUser.username, password: '', firstname: ''} );
            setError('');
            setComponentState('welcome');
        }).catch(err => {
            console.log('Error in account creation. Username may not be available or backend is offline. Error: ' + err);
            setError('Username is not available');
        });
    }

    if (componentState === 'welcome')
        return (
            <div className="control-card">
                <div className="page-header" style={{marginBottom:'0.25rem'}}>Hello, world!</div>
                <div>Sign in to view and save your transcript.</div>

                <form onSubmit={ handleSignInSubmit } style={{marginTop:'0.75rem'}}>
                    <TextField style={{marginBottom: '0.5rem'}} defaultValue={''} onChange={val => setFormUser( {username: val.target.value, password: formUser.password, firstname: ''} )} variant="outlined" label="Username" size="small" type="text"/>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <TextField defaultValue={''} onChange={val => setFormUser( {username: formUser.username, password: val.target.value, firstname: ''} )} error={ formUser.password.length > 64 } variant="outlined" label="Password" size="small" type="password"/>
                        <Button onClick={ handleSignInSubmit } disabled={ !(formUser.username && formUser.password) } color="primary" variant="contained" aria-label="sign-in">Go</Button>
                    </div>
                    <div style={{display: error ? 'block' : 'none'}} className="error-message">{error}</div>
                </form>

                <div style={{marginTop: '0.5rem', marginBottom:'0.25rem'}}>Don't have an account?</div>
                <Button onClick={ handleGoToCreateAcct } variant="outlined" size="small" aria-label="create an account">Create an Account</Button>
            </div>
        );
    else if (componentState === 'loggedIn')
        return (
            <div className="control-card">
                <div className="page-header" style={{marginBottom:'0.25rem'}}>Welcome back, {user.firstname}</div>

                <form style={{margin:'0.75rem 0', display:'flex', justifyContent:'space-between', alignItems:'center'}} autoComplete="off">
                    <Button onClick={ handleSignOutSubmit } variant="contained" aria-label="save">Sign Out</Button>
                    <Button onClick={ handleRefresh } variant="contained" aria-label="refresh">Refresh</Button>
                    <Button onClick={ handleSave } color="primary" variant="contained" aria-label="save">Save</Button>
                </form>
            </div>
        );
    else if (componentState === 'createAcct')
        return (
            <div className="control-card">
                <div style={{marginBottom: '0.25rem', fontSize: '1.5rem', fontWeight: '500'}}>Create your Account</div>
                <div>We'll just need a couple things from you</div>
                <form style={{marginTop: '0.75rem'}}>
                    <TextField defaultValue={formUser.username} onChange={val => setFormUser( {username: val.target.value, password: formUser.password, firstname: formUser.firstname} )} name="username" variant="outlined" label="Username" size="small" type="text"/>
                    <div style={{display: error ? 'block' : 'none', margin: '0.1rem 0'}} className="error-message">{error}</div>
                    <TextField style={{marginTop: '0.5rem'}} defaultValue={''} onChange={val => setFormUser( {username: formUser.username, password: val.target.value, firstname: formUser.firstname} )} error={ formUser.password.length > 64 } variant="outlined" label="Password" size="small" type="password"/>
                    <TextField style={{marginTop: '0.5rem', marginBottom:'0.75rem'}} defaultValue={formUser.firstname} onChange={val => setFormUser( {username: formUser.username, password: formUser.password, firstname: val.target.value} )} name="firstname" variant="outlined" label="First Name" size="small" type="text"/>
                    <div style={{display: 'flex'}}>
                        <Button onClick={ handleCancelCreateAcct } style={{marginRight: '0.5rem'}} variant="contained" aria-label="cancel">Cancel</Button>
                        <Button onClick={ handleCreateAcct } disabled={ !(formUser.username && formUser.password && formUser.firstname) } color="primary" variant="contained" aria-label="submit">Let's go</Button>
                    </div>
                </form>
            </div>
        );
};

export default UserControlCard; 