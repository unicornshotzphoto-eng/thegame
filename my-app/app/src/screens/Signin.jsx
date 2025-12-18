import React, { useState } from 'react';
import { 
    Text,
    TouchableOpacity, 
    TouchableWithoutFeedback, 
    StyleSheet, 
    TextInput, 
    View, 
    Keyboard
    } from 'react-native';
import { showAlert } from '../utils/alert';
import api from '../core/api';
import { log } from '../core/utils';
import useStore from '../core/global';
import { storeUserData, storeAuthToken } from '../core/secureStorage';

function Signin(props) {
    console.log('Signin component rendered');
    console.log('Signin props:', props);
    console.log('Signin navigation:', props?.navigation);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const login = useStore((state) => state.login);

    const validate = () => {
        console.log('Validating...');
        if (!username.trim()) {
            console.log('Username is empty');
            showAlert('Username required', 'Please enter your username');
            return false;
        }
        if (!password.trim()) {
            console.log('Password is empty');
            showAlert('Password required', 'Please enter your password');
            return false;
        }
        if (password.length < 6) {
            console.log('Password too short');
            showAlert('Weak password', 'Password must be at least 6 characters');
            return false;
        }
        console.log('Validation passed');
        return true;
    };

    const handleSubmit = () => {
        console.log('testing');
        console.log('Username:', username);
        console.log('Password:', password);
        if (!validate()) return;
        
        api({
            method: 'POST',
            url: 'quiz/signin/',
            data: {
                username: username,
                password: password
            }
        })
        .then(async response => {
            console.log('=== Sign in Response JSON ===');
            console.log(JSON.stringify(response.data, null, 2));
            console.log('=== End Response ===');
            
            // Update Zustand store with user data
            login(response.data.user);
            
            // Save user data to encrypted storage for persistence
            await storeUserData(response.data.user);
            
            // Store auth token (access token from JWT)
            if (response.data.access) {
                await storeAuthToken(response.data.access);
                console.log('Auth token stored successfully');
            } else if (response.data.token) {
                await storeAuthToken(response.data.token);
                console.log('Auth token stored successfully');
            }
            
            // Clear input fields
            setUsername('');
            setPassword('');
            
            // Navigate to Home screen
            console.log('Attempting navigation...');
            console.log('props:', props);
            console.log('props.navigation:', props?.navigation);
            if (props && props.navigation) {
                console.log('Navigating to Home...');
                try {
                    props.navigation.navigate('Home');
                    console.log('Navigation called successfully');
                } catch (error) {
                    console.error('Navigation error:', error);
                }
            } else {
                console.warn('Navigation not available');
            }
            
            showAlert('Sign in successful', `Welcome back, ${response.data.user.username}!`);
        })
        .catch(error => {
            console.log('=== Sign in Error ===');
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Data:', JSON.stringify(error.response.data, null, 2));
                console.log('Headers:', error.response.headers);
                showAlert('Sign in failed', `Error: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.log('No response received:', error.request);
                console.log('Full error:', error);
                showAlert('Network Error', 'Could not connect to server. Make sure the API is running at http://localhost:8000');
            } else {
                console.log('Sign in error:', error.message);
                showAlert('Sign in failed', error.message);
            }
        });
    };

    const handleSignUp = () => {
        if (props && props.navigation) {
            props.navigation.navigate('Signup');
        } else {
            showAlert('Navigation', 'Sign up navigation attempted');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.title}>Sign in</Text>

                <View style={styles.field}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Your username"
                        placeholderTextColor="#999"
                        style={styles.input}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        autoComplete='off'
                        autoCapitalize='none'
                        value={password}
                        onChangeText={setPassword}
                        placeholder="At least 6 characters"
                        placeholderTextColor="#999"
                        style={styles.input}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Sign in</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
                    <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupLink}>Sign up</Text></Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
}

export default Signin;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 40 },
    title: { color: '#fff', fontSize: 22, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
    field: { marginBottom: 12 },
    label: { color: '#ddd', marginBottom: 6 },
    input: { backgroundColor: '#111', color: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6 },
    button: { marginTop: 16, backgroundColor: '#1a73e8', paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '600' },
    ghostButton: { marginTop: 12, alignItems: 'center' },
    ghostText: { color: '#aaa' },
    divider: { marginTop: 20, marginBottom: 20, height: 1, backgroundColor: '#333' },
    signupButton: { alignItems: 'center' },
    signupText: { color: '#999', fontSize: 14 },
    signupLink: { color: '#1a73e8', fontWeight: '600' },
});