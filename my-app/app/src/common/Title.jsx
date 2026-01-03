import { Text, View } from 'react-native';


function Title({ text }) {

    return (
        <Text style = {{
            color: '#E8C9A0',
            fontSize: 48,
            textAlign: 'center',
            fontFamily: 'montserrat-regular',
            fontWeight: 'bold',
            marginBottom: 20,
        }}>
            {text}
        </Text>
    );
}       

       
export default Title;