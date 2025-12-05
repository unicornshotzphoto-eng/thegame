import React, { useState } from 'react';
import { 
    Text,
    TouchableOpacity, 
    TouchableWithoutFeedback, 
    StyleSheet, 
    TextInput, 
    View, 
    ScrollView, 
    Keyboard,
    KeyboardAvoidingView
    } from 'react-native';
import { showAlert } from '../utils/alert';

function signin(props) {
    console.log('Signin component rendered');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const validate = () => {
        console.log('Validating...');
        if (!email.trim()) {
            console.log('Email is empty');
            showAlert('Email required', 'Please enter your email address');
            return false;
        }
        if (!email.includes('@')) {
            console.log('Email invalid format');
            showAlert('Invalid email', 'Please enter a valid email address');
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
        console.log('Email:', email);
        console.log('Password:', password);
        if (!validate()) return;
        showAlert('Signed in', 'Sign in button pressed');
    };

    const handleTestSignIn = () => {
        showAlert('Test Sign In', 'Test sign in button pressed');
    };

    const handleSignUp = () => {
        if (props && props.navigation) {
            props.navigation.navigate('Signup');
        } else {
            showAlert('Navigation', 'Sign up navigation attempted');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <KeyboardAvoidingView behavior='height' style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss();}}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Sign in</Text>

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

                        <TouchableOpacity style={styles.ghostButton} onPress={handleTestSignIn}>
                            <Text style={styles.ghostText}>Sign in (test)</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
                            <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupLink}>Sign up</Text></Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </ScrollView>
    );
}

export default signin;

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
    signupButton: { alignItems: 'center' },
    signupText: { color: '#999', fontSize: 14 },
    signupLink: { color: '#1a73e8', fontWeight: '600' },
});