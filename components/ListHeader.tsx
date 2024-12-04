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
        backgroundColor: "purple",
        marginBottom: 5,
    },
    headerText: {
        fontSize: 24,
        textAlign: "center",
       
    }
})