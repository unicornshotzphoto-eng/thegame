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

function signup(props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const validate = () => {
        if (!name.trim()) {
            showAlert('Name required', 'Please enter your name');
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
        if (props && typeof props.onAuthSuccess === 'function') {
            props.onAuthSuccess('TEST_TOKEN');
            return;
        }
        showAlert('Signed up', 'Signup simulated (no backend)');
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
                <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss();}}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Create account</Text>

                        <View style={styles.field}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Your name"
                                placeholderTextColor="#999"
                                style={styles.input}
                                autoCapitalize="words"
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
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </ScrollView>
    );
}

export default signup;

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