import React, { useState } from 'react';
import { 
    Text,  
    TouchableWithoutFeedback, 
    TouchableOpacity, 
    StyleSheet, 
    TextInput, 
    View, 
    ScrollView, 
    KeyboardAvoidingView 
} from 'react-native';
import { showAlert } from '../utils/alert';
import api from '../core/api';
import { log } from '../core/utils';
import useStore from '../core/global';
import { storeUserData, storeAuthToken } from '../core/secureStorage';

function Signup(props) {
    console.log('Signup component rendered');
    console.log('Signup props:', props);
    console.log('Signup navigation:', props?.navigation);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const login = useStore((state) => state.login);

    const validate = () => {
        if (!username.trim()) {
            showAlert('Username required', 'Please enter your username');
            return false;
        }
        if (!email.trim()) {
            showAlert('Email required', 'Please enter your email');
            return false;
        }
        if (!email.includes('@')) {
            showAlert('Invalid email', 'Please enter a valid email address');
            return false;
        }
        if (password.length < 6) {
            showAlert('Weak password', 'Password must be at least 6 characters');
            return false;
        }
        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'Please make sure both passwords are the same');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        
        log('Attempting signup with:', { username, email });
        
        api({
            method: 'POST',
            url: 'quiz/signup/',
            data: {
                username: username,
                email: email,
                password: password
            }
        })
        .then(async response => {
            log('=== Sign up Response JSON ===');
            log(response.data);
            log('=== End Response ===');
            
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
            const currentUsername = username;
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            
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
            
            showAlert('Sign up successful', `Welcome ${currentUsername}!`);
        })
        .catch(error => {
            log('=== Sign up Error ===');
            if (error.response) {
                log('Status:', error.response.status);
                log('Data:', error.response.data);
                log('Headers:', error.response.headers);
                showAlert('Sign up failed', `Error: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                log('No response received:', error.request);
                log('Full error:', error);
                showAlert('Network Error', 'Could not connect to server. Make sure the API is running at http://localhost:8000');
            } else {
                log('Error:', error.message);
                showAlert('Sign up failed', error.message);
            }
            log('=== End Error ===');
        });
    };

    const handleTestSignUp = () => {
        if (props && typeof props.onAuthSuccess === 'function') {
            props.onAuthSuccess('TEST_TOKEN');
        }
    };

    const handleSignIn = () => {
        if (props && props.navigation) {
            props.navigation.navigate('Signin');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <KeyboardAvoidingView behavior='height' style={{ flex: 1 }}>
               
                    <View style={styles.content}>
                        <Text style={styles.title}>Create account</Text>

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
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="you@example.com"
                                placeholderTextColor="#999"
                                style={styles.input}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="At least 6 characters"
                                placeholderTextColor="#999"
                                style={styles.input}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Re-enter password"
                                placeholderTextColor="#999"
                                style={styles.input}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Sign up</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.ghostButton} onPress={handleTestSignUp}>
                            <Text style={styles.ghostText}>Sign up (test)</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.signinButton} onPress={handleSignIn}>
                            <Text style={styles.signinText}>Already have an account? <Text style={styles.signinLink}>Sign in</Text></Text>
                        </TouchableOpacity>
                    </View>
                
            </KeyboardAvoidingView>
        </ScrollView>
    );
}

export default Signup;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    content: { padding: 20, paddingTop: 40 },
    title: { color: '#fff', fontSize: 22, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
    field: { marginBottom: 12 },
    label: { color: '#ddd', marginBottom: 6 },
    input: { backgroundColor: '#111', color: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6 },
    button: { marginTop: 16, backgroundColor: '#1a73e8', paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '600' },
    ghostButton: { marginTop: 12, alignItems: 'center' },
    ghostText: { color: '#aaa' },
    divider: { marginTop: 20, marginBottom: 20, height: 1, backgroundColor: '#333' },
    signinButton: { alignItems: 'center' },
    signinText: { color: '#999', fontSize: 14 },
    signinLink: { color: '#1a73e8', fontWeight: '600' },
});