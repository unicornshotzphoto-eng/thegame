import { Text } from 'react-native';


function Title({ text }) {

    return (
        <Text style = {{
            color: 'white',
            fontSize: 48,
            textAlign: 'center',
            fontFamily: 'montserrat-regular',
        }}>
            {text}
        </Text>
    );
}       

       
export default Title;