import { Text, View, StyleSheet, Pressable, TextInput, FlatList, Modal, Switch } from 'react-native'
import { useLocalSearchParams, Link, useNavigation } from 'expo-router'
import { useEffect, useContext, useState } from 'react'
import { FirestoreContext } from '@/contexts/FirestoreContext'
import { AuthenticationContext } from '@/contexts/AuthenticationContext'
import { doc, getDoc, getDocs, collection, addDoc, deleteDoc, updateDoc } from '@firebase/firestore'
import { Ionicons } from '@expo/vector-icons'
import { DisplayDate } from '@/components/DisplayDate'

import { ListPrototype } from '@/interfaces/ListInterface'
import { ListEmpty } from '@/components/ListEmpty'
import { ListHeader } from '@/components/ListHeader'
import { ListItemSeperator } from '@/components/ListItemSeperator'

import { ItemPrototype } from '@/interfaces/ItemInterface'
import { SwipeListView } from 'react-native-swipe-list-view'

export default function DetailScreen(props: any) {
    const [list, setList] = useState<ListPrototype | any>()
    const [listItems, setListItems] = useState<any[]>()
    //modal states
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const [itemName, setItemName] = useState<string>('')
    const [itemNote, setItemNote] = useState<string>('')
    const [itemStatus, setItemStatus] = useState<boolean>(false)
    const [itemBudget, setItemBudget] = useState<number>(0)
    const [editingItem, setEditingItem]= useState<any>(null);
    
    // access navigation object via hook
    const navigation = useNavigation()
    const { id }: any = useLocalSearchParams()
    const { name } = useLocalSearchParams()

    // set screen options
    useEffect(() => {
        navigation.setOptions({
            title: "Go back to lists overview",
            headerRight: () => (
                <Pressable 
                    style={ styles.button } 
                    onPress={ () => setModalVisible(true) }
                >
                    <Ionicons style={ styles.buttonText } name="add" size={30} />
                </Pressable>
            )
        })
    }, [navigation])

    const db = useContext(FirestoreContext)
    const auth = useContext(AuthenticationContext)



    const getList = async () => {
        const ref = doc(db, `listusers/${auth.currentUser.uid}/lists`, id)
        const list = await getDoc(ref)
        let listData: ListPrototype | any = list.data()
        listData.id = id
        setList(listData)
        getListItems()
    }
    // add an item to the list
    const addListItem = async () => {
        const colRef = collection( db, `listusers/${auth.currentUser.uid}/lists/${id}/items`)
        const data = { 
            name: itemName, 
            note: itemNote, 
            date: new Date().getTime(), 
            status: itemStatus, 
            budget: itemBudget,
        };

        try{
            const document = await addDoc( colRef , data )
            console.log( document.id )
            // clear the input and notes ready for next input
        
            setItemName('')
            setItemNote('')
            setItemBudget(0)
            setItemStatus(false)          
            getListItems()
        }
        catch(error){
            console.error("Error adding item to the list", error);
        }
        
    };
    const deleteListItem = async(itemId: string): Promise<void>=>{
        const docRef = doc(db, `listusers/${auth.currentUser.uid}/lists/${id}/items/${itemId}` )
        try{
            await deleteDoc(docRef)
            getListItems()

        }catch{
            console.error("Error deleting document: ")
        }
    }

    // get all items in the list
    const getListItems = async () => {
        const ref = collection(db, `listusers/${auth.currentUser.uid}/lists/${id}/items`)
        console.log(`listusers/${auth.currentUser.uid}/lists/${id}/items`)
        const snapshot = await getDocs(ref)
        let items:ItemPrototype[] = []
        snapshot.forEach((item) => {
            let listmember:any = item.data()
            listmember.id = item.id
            items.push(listmember)
        })
        setListItems( items )
    }

    //for updating the existing item
    const updateListItem = async(itemId: string, updatedData: Partial<ItemPrototype>) =>{
        const docRef = doc(db,'listusers/${auth.currentUser.uid}/lists/${id}/items/${itemId')
        try{
            await updateDoc(docRef, updatedData);
            console.log('Document with ID ${itemId} updated');
            getListItems();

        }
        catch(error){
            console.error("Error updating document: ", error)
        }
    }

    const openEditModal = (item: ItemPrototype) =>{
        setEditingItem(item);
        setItemName(item.name);
        setItemNote(item.note)
        setItemStatus(item.status)
        setItemBudget(item.budget)
        setModalVisible(true);
    }
    const closeModal = () =>{
        setEditingItem(null);
        setItemName('');
        setItemNote('')
        setItemStatus(false)
        setItemBudget(0)
        setModalVisible(false);
    }

    const saveItem = async() =>{
        if(editingItem){
            const updatedData ={
                name: itemName,
                note:itemNote,
                status:itemStatus,
                budget:itemBudget,
            }
                await updateListItem(editingItem.id, updatedData)
        }
        else{
            await addListItem();
        }
        closeModal()
    }
    

    useEffect(() => {
        if (auth) {
            //console.log( auth )
            getList()
        }
    }, [id])

    //for delete
    

    const renderHiddenItem = ( data: {item: ItemPrototype}, rowMap: any) =>(
        <View style={styles.rowBack}>
            <Pressable
         style={[styles.backLeftBtn, styles.backLeftBtnLeft ]}
        onPress={() => openEditModal(data.item)}
        >
            <Text style = {styles.backTextWhite}></Text>
            <Ionicons name="pencil" size={30} color="black"/>

        </Pressable>
        <Pressable
         style={[styles.backRightBtn, styles.backRightBtnRight ]}
        onPress={() => deleteListItem(data.item.id)}
        >
            <Text style = {styles.backTextWhite}></Text>
            <Ionicons name="trash" size={30} color="black"/>

        </Pressable>
        </View>
    )
    const [confirmModalVisibile, setConfirmModalVisible] = useState<boolean>(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    
    const renderConfirmModal =() =>(
        <Modal
        transparent ={true}
        visible ={confirmModalVisibile}
        animationType='slide'
        >
            <View>
            <Text> Are you sure you want to delete this item?</Text>
                <View>
                    <Pressable
                    onPress={()=>handleConfirmDelete()}
                    >
                        <Text>Yes</Text>
                    </Pressable>
                    <Pressable
                    onPress={()=>setConfirmModalVisible(false)}
                    >
                        <Text>Cancel</Text>
                    </Pressable>
                </View>
            </View>
            
        </Modal>
    )
    const handleConfirmDelete = async() =>{
        if(itemToDelete){
            await deleteListItem(itemToDelete)
            setConfirmModalVisible(false)
            setItemToDelete(null)
        }
    }

    // list renderer
    const renderItems = ({ item }: any) => (
        <View style={ styles.item }>
                <View style={ styles.itemLeft }> 
                <Text style ={styles.title}>{item.name}</Text>
                <Text>Status: {item.status? 'Completed' : 'Pending'} </Text>

                </View>
                <View style={ styles.itemRight }>
                <Text style={styles.date }>
                <DisplayDate date={item.date} mode="date" />
              </Text>
                <Text style={styles.date }>Budget: ${item.budget}</Text>
                
                </View>
            
            </View>
    )

    if (list) {
        return (
            <View style={styles.page}>
                <SwipeListView
                     data={listItems}
                     renderItem={renderItems}
                     renderHiddenItem={renderHiddenItem}
                     rightOpenValue={-75}
                     leftOpenValue={75}
                     ListEmptyComponent={<ListEmpty text="You have no items! Add some to this list" />}
                    ListHeaderComponent={<ListHeader text={list.name} />}
                    ItemSeparatorComponent={ListItemSeperator}
                
                />
                {renderConfirmModal()}

                    {/* for adding new bucketlist item screen*/ }
                <Modal visible={ modalVisible }>
                    <Pressable style={styles.modalCloseButton} onPress={ () => setModalVisible( false) }>
                        <Ionicons name="close" size={30} />
                    </Pressable>
                    <View style={ styles.modalContainer }>
                        <Text style={ styles.modalLabel }>Title</Text>
                        <TextInput 
                            style={ styles.modalInput }
                            value={ itemName } 
                            placeholder="Name of the item"
                            onChangeText={ (val) => setItemName(val) }
                        />
                        <Text style={ styles.modalLabel }>Description</Text>
                        <TextInput 
                            multiline={true} 
                            style={ styles.modalInput }
                            placeholder='Notes for item'
                            numberOfLines={4}
                            value={itemNote}
                            onChangeText={ (val) => setItemNote(val) }
                        />
                        <Text style={ styles.modalLabel }>Budget</Text>
                        <TextInput 
                            style={ styles.modalInput }
                            placeholder='Enter target budget '
                            numberOfLines={4}
                            value={itemBudget?.toString()}
                            keyboardType="numeric"
                            onChangeText={ (val) => setItemBudget(Number(val)) }
                        />
                        <View style={styles.switchContainer}>
                            <Text style={styles.modalLabel}> Status 
                            </Text>
                                <Switch
                                    value={itemStatus}
                                    onValueChange = {(val) =>setItemStatus(val)}
                                />
                                <Text>{itemStatus ? 'Completed' : 'Pending'}</Text>
                            
                        </View>

                        <Pressable 
                            style={ styles.modalSaveButton }
                            onPress={ () => {
                                addListItem()
                                setModalVisible( false )
                            } }
                        >
                            <Text style={ styles.modalSaveButtonText }>Add Item</Text>
                        </Pressable>
                    </View>
                </Modal>
            </View>
        )
    }
    else {
        return null
    }

}

const styles = StyleSheet.create({
    button: {
        padding: 10,
        borderRadius: 25,
        width: 50,
        height: 50,
        backgroundColor: "darkgreen",
        marginRight: 10,
    },
    buttonText: {
        color: "white",
    },
    modalContainer: {
        flex: 1,
        padding: 20,
        marginTop: 100,
    },
    page: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 10,
        marginTop: 100,
    },
    modalCloseButton: {
        position: "absolute",
        right: 10,
        top: 10,
        zIndex: 100,
    },
    modalInput: {
        padding: 10,
        borderColor: "#666666",
        borderWidth: 2,
        marginBottom: 15,
        borderRadius: 4,
    },
    modalLabel: {
        fontWeight: 600,
    },
    modalSaveButton: {
        width: "100%",
        padding: 10,
        backgroundColor: "#333333",
    },
    modalSaveButtonText: {
        color: "#EEEEEE",
        textAlign: "center",
    },
    item: {
        padding: 10,
        backgroundColor: "#d9d9d9",
        minWidth: '99%',
       // marginLeft: 2,
        margin: 2,
        // height: 100,
        height: 80,
      justifyContent: 'space-between',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center'

    },
    switchContainer: {
         flexDirection: 'row',
         alignItems: 'center',
         marginVertical: 10,
     },
    date:{
        flexDirection: "row",
        justifyContent: "flex-end",
        alignSelf:"flex-end" 
    },
    title:{
        flexDirection: "row",
        alignSelf:"flex-start",
        fontStyle: "italic",
        fontWeight: "bold",
        fontSize: 20,
    },
    itemLeft:{
        width: "50%",
        justifyContent: 'flex-start',
    },
    itemRight:{
        width: "50%",
        justifyContent: 'flex-end',
        alignSelf:"flex-end"
    },
    rowBack: { 
        alignItems: 'center', 
        // backgroundColor: "black", 
        flex: 1, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingLeft: 15, }, 
        backRightBtn: { 
            alignItems: 'center', 
            bottom: 0, 
            justifyContent: 'center',
            position: 'absolute', 
            top: 0, 
            width: 75, 
        }, 
        backRightBtnRight: { 
            // backgroundColor: 'red', 
            right: 0, 
        }, 
        backTextWhite: 
        { color: "black",
        },
        backLeftBtn: { 
            alignItems: 'center', 
            bottom: 0, 
            justifyContent: 'center', 
            position: 'absolute', 
            top: 0, 
            width: 75, 
            // backgroundColor: 'blue', 
            left: 0, 
        }, 
        backLeftBtnLeft: { 
            // backgroundColor: 'blue',
        },



})