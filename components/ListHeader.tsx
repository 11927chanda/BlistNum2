import { Text, View, StyleSheet, FlatList } from 'react-native'
export function ListHeader(props:any){
    return(
        <View style = { styles.header }>
            <Text style = { styles.headerText}>
                {props.text}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        fontSize:24,
        padding: 6,
        backgroundColor: "#4a4d53",
        marginBottom: 5,
        
       },
    headerText: {
        fontSize: 24,
        textAlign: "center",
        color:"white",
        fontWeight: "bold",
       
    },
})