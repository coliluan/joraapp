// styles/globalStyles.ts
import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  notification: {
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#171717',
    fontFamily: 'Poppins',
  },
  phone: {
    color: '#171717',
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
  },
  modal: {
    backgroundColor: '#FAFAFA'
  },
  
  dialogTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#EB2328'
  },
  dialogText: {
    textAlign: 'center',
    fontSize:22,
  },
  dialogButton : {
    backgroundColor:'#fff',
    width:'50%'
  },
  buttonDialog :{
    backgroundColor:'#EB2328',
    width:'50%',
    color: '#fff'
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    height: 60,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 18,
    color: '#1F1F1F',
    justifyContent: 'center',
  },
  globalContainer:{
    display: 'flex', 
    gap: 10
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  registerButton: {
    backgroundColor: '#D32F2F',
    width: 180,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
  },
 
  guestsImageWrapper: {
  width: '100%',
  height: 200,
  borderRadius: 10,
  overflow: 'hidden',
  marginBottom: 20,
},

guestsImage: {
  width: '100%',
  height: '100%',
  borderRadius: 10, // Still needed for iOS
},
});