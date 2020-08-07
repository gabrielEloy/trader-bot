import actions from '../actionTypes'

export const userInitialValue = {
    email: '',
    userId: '',
    password: '',
    isRealAccount: false,
    balance: 0
}

const userReducer = (state, action) =>  {
    console.log({action})
    switch(action.type){
        case actions.USER_LOGIN_SUCCESS:
            return {
                ...state,
                ...action.value
            }
        default:
            return state
    }
}

export default userReducer


