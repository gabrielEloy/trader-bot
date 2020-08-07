export const playInitialValue = {
    martingale_coef: 2,
    num_martingale: 2,
    delay_martingale: 0,
    soros_coef: 2,
    num_soros: 2,
    delay_soros: 0,
    stop_loss: 50,
    stop_gain: 50,
    initial_value: 50,
    isMartingale: false,
    isSoros: false
}

const playReducer = (state, action) =>  {
    switch(action.type){
        default:
            return state
    }
}


export default playReducer


