import { Text, View, StyleSheet, FlatList } from 'react-native'

export function ListItemSeperator(props:any){
    return(
        <View style = { styles.seperator }>
            
        </View>
    )
}

const styles = StyleSheet.create({
    seperator: {
        height: 10,
        // backgroundColor: "#32173b",
        minWidth: '99%',
        marginLeft: 2,
        borderRadius: 10,
        
    },
    
})