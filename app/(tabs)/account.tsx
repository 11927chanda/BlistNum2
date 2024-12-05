import { Image, StyleSheet, View, Text, Pressable } from 'react-native'
import { useContext, useState } from 'react'
import { AuthenticationContext } from '@/contexts/AuthenticationContext'
import { onAuthStateChanged, signOut } from '@firebase/auth'
import { useNavigation, router } from 'expo-router'

export default function AccountScreen() {
    const[ currentUser, setCurrentUser ] = useState<any | null>()

    const fbauth = useContext( AuthenticationContext )
    const navigation = useNavigation()
    
    onAuthStateChanged( fbauth, ( user:any | null ) => {
        if( user ) {
            // user is signed in
            setCurrentUser( user )
            console.log( user )
        }
        else {
            // user is not signed in
            setCurrentUser( null )
            router.navigate('/login')
        }
    })

    const SignOutUser = () => {
        signOut( fbauth )
        .then( () => {
            // sign out successful
        })
        .catch( () => {
            // error occured
        })
    }

    return (
    //   <View>
    //     <Text>Account Page</Text>
    //     <Pressable onPress={ () => SignOutUser() }>
    //         <Text>Sign out</Text>
    //     </Pressable>
    //   </View>

    <View style={ styles.container }>
            <Text style ={ styles.title }> Profile Screen</Text>
            <View style ={ styles.containermain } >
                <View style ={ styles.container1 }>
                {/* User Profile */}
                <Image
                source ={require('../../assets/images/user1.jpg')}
                style={styles.image}
                />
                </View>
                <View style ={ styles.container2 }>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}> John Doe</Text>
                <Text style={{ fontSize: 18, fontWeight: '600', color: 'black', marginTop: 10 }}>Travel Enthusiast </Text>
                <Pressable 
                style ={ styles.editProfile }>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: 'white', marginTop: 10 }}>Edit Profile </Text>
                </Pressable>
                </View>

                
            </View>
            
            <Pressable style ={ styles.button } 
            onPress={ ()=> SignOutUser()}>
                
                <Text style ={ styles.buttonText }>Sign Out</Text>
            </Pressable>
        </View>
    );
  }
  const styles = StyleSheet.create({
    container: {
         flex: 1,
    },
    title:{
        
        height: 40,
        backgroundColor: "#693604",
        margin: 2,
        padding: 5,
        textAlign:"center",
        borderRadius:5,
        color: "white",
        fontSize: 18,
        fontWeight: 'bold',


    },
    containermain:{
        margin: 2,
        padding: 5,
        flexDirection: 'row', 
        //justifyContent: 'space-between',

    },
    container1:{
        margin: 0,
        padding: 0,
        height: 200,
        width: 200,
        //backgroundColor: "black",

    },
    image: { 
        width: 200,
        height: 200,
        borderRadius: 50,
     },
    container2:{
        margin: 5,
        padding: 5,
        height: 200,
       

    },
    editProfile:{
        height: 40,
        backgroundColor: "#693604",
        margin: 2,
        padding: 0,
        borderRadius:5,
        alignItems:"center",
        
    },
    button:{
        backgroundColor: "#9e7409",
        padding: 8,
        margin: '2%',
        borderRadius:5,

    },
    buttonText:{
        color: "#080807",
        textAlign: "center",
        fontSize: 16
    },  
})