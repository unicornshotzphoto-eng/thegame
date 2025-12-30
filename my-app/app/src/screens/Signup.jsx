import React, { useState } from 'react';
import { 
    Text,  
    TouchableWithoutFeedback, 
    TouchableOpacity, 
    StyleSheet, 
    TextInput, 
    View, 
    ScrollView, 
    KeyboardAvoidingView,
    SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { showAlert } from '../utils/alert';
import api from '../core/api';
import { log } from '../core/utils';
import useStore from '../core/global';
import { storeUserData, storeAuthToken } from '../core/secureStorage';
import { THEME } from '../constants/appTheme';

function Signup(props) {
    console.log('Signup component rendered');
    const router = useRouter();
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
            
            // Navigate to Home screen using Expo Router
            router.replace('/(tabs)');
            
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

    const handleSignIn = () => {
        router.push('/signin');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <KeyboardAvoidingView behavior='padding' style={styles.keyboardView}>
                    <View style={styles.centerContainer}>
                        <View style={styles.cardContainer}>
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

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.signinButton} onPress={handleSignIn}>
                            <Text style={styles.signinText}>Already have an account? <Text style={styles.signinLink}>Sign in</Text></Text>
                        </TouchableOpacity>
                    </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
}

export default Signup;

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: THEME.secondary,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: THEME.spacing.xl,
    },
    keyboardView: {
        flex: 1,
        width: '100%',
    },
    centerContainer: {
        width: '85%',
        maxWidth: 500,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: { 
        padding: THEME.spacing.xl, 
        paddingTop: THEME.spacing.xl,
    },
    cardContainer: {
        width: '100%',
        backgroundColor: THEME.surfaceDark,
        borderRadius: THEME.borderRadius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    title: { 
        color: THEME.text.primary, 
        fontSize: 28, 
        fontWeight: '700', 
        marginBottom: THEME.spacing.xl, 
        textAlign: 'center' 
    },
    field: { 
        marginBottom: THEME.spacing.lg 
    },
    label: { 
        color: THEME.text.secondary, 
        marginBottom: THEME.spacing.sm,
        fontWeight: '500'
    },
    input: { 
        backgroundColor: THEME.surfaceDark, 
        color: THEME.text.primary,
        paddingHorizontal: THEME.spacing.md, 
        paddingVertical: THEME.spacing.md, 
        borderRadius: THEME.borderRadius.md,
        borderWidth: 1,
        borderColor: THEME.borderLight
    },
    button: { 
        marginTop: THEME.spacing.lg, 
        backgroundColor: THEME.primary, 
        paddingVertical: THEME.spacing.md, 
        borderRadius: THEME.borderRadius.md, 
        alignItems: 'center' 
    },
    buttonText: { 
        color: THEME.text.primary, 
        fontWeight: '700',
        fontSize: 16
    },
    ghostButton: { 
        marginTop: THEME.spacing.md, 
        alignItems: 'center' 
    },
    ghostText: { 
        color: THEME.text.tertiary 
    },
    divider: { 
        marginTop: THEME.spacing.xl, 
        marginBottom: THEME.spacing.xl, 
        height: 1, 
        backgroundColor: THEME.borderLight 
    },
    signinButton: { 
        alignItems: 'center' 
    },
    signinText: { 
        color: THEME.text.secondary, 
        fontSize: 14 
    },
    signinLink: { 
        color: THEME.primary, 
        fontWeight: '700' 
    },
});