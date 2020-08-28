from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from datetime import datetime, timedelta
import concurrent.futures
import json
import time
from iqoptionapi.stable_api import IQ_Option

from models import *
from settings import *
from IqOptionController import *
from crypto import *

CORS(app, support_credentials=True)

""" Begin Login IQOption """
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    res = User.verify_platform_status(data['email'], data['password'])
    print(res)
    user = User.get_user_object(data['email'])
    print(user)

    print(res)

    if (res == True):
        res = Authentication.login(True, data['email'], data['password'], data['mode'], user.user_group_id)
        print(res)

    response = Response(json.dumps(res), 200, mimetype='application/json')

    return response
""" End Login IQOption """

""" Begin Signal List """
@app.route('/indexSignal')
def indexSignal():    
    return jsonify({'records': ConfigSignsList.index_signal()})

@app.route('/saveSignal', methods=['POST'])
def saveSignal():
    data = request.get_json()

    currency = data['currency']
    if data['otc'] == True: 
        currency += '-OTC'

    res = ConfigSignsList.add_signal(
        data['date']
        ,data['hour']
        ,data['duration_time']
        ,currency
        ,data['type']
    )

    return Response(json.dumps(res), 200, mimetype='application/json')

@app.route('/deleteSignal', methods=['DELETE'])
def deleteSignal():
    data = request.args.get('signal_id')

    res = ConfigSignsList.delete_signal(data)
    
    return Response(json.dumps(res), 200, mimetype='application/json')

@app.route('/deleteAllSignal', methods=['DELETE'])
def deleteAllSignal():
    res = ConfigSignsList.delete_all_signal()

    return Response(json.dumps(res), 200, mimetype='application/json')
""" End Signal List """

""" Begin User """
@app.route('/indexUsers')
def indexUsers():
    data = request.args.get('user_group_id')
    return jsonify({'users': User.index_users(data)})


@app.route('/getUser')
def getUser():
    data = request.get_json()

    email = data['email']
    user_group_id = data['user_group_id']
    user_data = User.get_user(email, user_group_id)

    if (user_data == None):
        response = {
            "type": "error",
            "message": "Não há cadastro com este e-mail"
        }
        return Response(json.dumps(response), 200, mimetype='application/json')

    return Response(json.dumps(user_data), 200, mimetype='application/json')


@app.route('/createUser', methods=['POST'])
def createUser():
    data = request.get_json()
    
    email = data['email']
    user_group_id = data['user_group_id']
    user_data = User.get_user(email, user_group_id)

    if (user_data != None):
        res = {
            "type": "error",
            "message": "Já existe um usuário com este e-mail."
        }
        return Response(json.dumps(res), 200, mimetype='application/json')

    pwd = data['password']
    crypted_password = None
    if pwd != None:
        crypted_password = doEncode(pwd)

    res = User.add_user(email, crypted_password, user_group_id)

    return Response(json.dumps(res), 200, mimetype='application/json')

@app.route('/setUserStatus', methods=['PATCH'])
def setUserStatus():
    data = request.args.get('email')

    res = User.update_user_status(data)
    return Response(json.dumps(res), 200, mimetype="application/json")

@app.route('/deleteUser', methods=['DELETE'])
def deleteUser():
    data = request.args.get('email')

    res = User.delete_user(data)
    
    return Response(json.dumps(res), 200, mimetype='application/json')
""" End User """


""" Begin Config Params """
@app.route('/indexConfiguration')
def indexConfiguration():
    data = request.args.get('email')

    user = User.get_user_object(data)

    return Response(json.dumps(ConfigParams.index_configuration(user.user_id)), 200, mimetype='application/json')


@app.route('/saveConfiguration', methods=['POST'])
def saveConfiguration():
    data = request.get_json()
    print(data)
    user_id = data['user_id']
    is_new = False
    if data['user_id'] == None:
        user = User.get_user_object(data['email'])
        user_id = user.user_id
        is_new = True
    
    res = ConfigParams.add_config_params(
        data['martingale_coef']
        ,data['num_martingale']
        ,data['num_soros']
        ,data['stop_loss']
        ,data['stop_gain']
        ,data['initial_value']
        ,data['delay_operation']
        ,data['delay_martingale']
        ,data['is_martingale']
        ,data['is_soros']
        ,user_id
        ,is_new
    )

    print(res)

    return Response(json.dumps(res), 200, mimetype='application/json')

""" @app.route('/start', methods=['POST'])
def start(): 
    print('fiz a requisicao')
    data = request.get_json()
    data['API'] = Authentication.login(False, data['email'], data['password'], data['mode'], data['user_group_id'])
    data['API'].connect()
    data['date'] = None
    data['duration_time'] = 30

    res = StartOperation.buy(data)
    return res """

@app.route('/start', methods=['POST'])
def start(): 
    data = request.get_json()
    data['API'] = Authentication.login(False, data['email'], data['password'], data['mode'], data['user_group_id'])
    data['date'] = None
    data['duration_time'] = 30

    res = StartOperation.buy(data)
    return res

@app.route('/check_win', methods=['POST'])
def check_win(): 
    data = request.get_json()
    
    try:
        API = IQ_Option(data['email'], data['password'])
        API.connect()
        res = API.get_optioninfo_v2(10)
    except:
        print('cai no except')
        time.sleep(3)
        print('passei do except')
        API = IQ_Option(data['email'], data['password'])
        API.connect()
        res = API.get_optioninfo_v2(10)
        
    try:
        if res:
            print(res)
            return res
        return {
            "type": "error",
            "message": "Houve um erro, por favor tente novamente"
            }, 400
    except:
        return {
            "type": "error",
            "message": "Houve um erro, por favor tente novamente"
            }, 400

""" @app.route('/teste', methods=['POST'])
def check_win_v3(): 
    data = request.get_json()
    API = Authentication.login(False, data['email'], data['password'], data['mode'], data['user_group_id'])
    API.connect()
    check, id = API.check_win_v3(data['id_number'])

    print(id)
    print(check)
    return 'ok'
         """

    


""" @app.route('/start', methods=['POST'])
def start(): # this function will start and receive value, then must be recursive
    # alem do valor inicial, vou passar se foi win ou loss e de quanto foi
    i = 0
    data = request.get_json()
    
    email = data['email']
    password = data['password']
    mode = data['mode']
    user_group_id = data['user_group_id']

    martingale_coef = float(data['martingale_coef'])
    num_soros = int(data['num_soros'])
    num_martingale = int(data['num_martingale'])
    initial_value = float(data['initial_value'])
    value = float(data['initial_value'])
    is_martingale = data['is_martingale']
    is_soros = data['is_soros']

    hand_soros = data['hand_soros']
    result_before = data['result']
    profit_before = data['profit']
    agregated_value = data['agregated_value']

    num_martingale_original = int(data['num_martingale_original'])
    num_soros_original = int(data['num_soros_original'])
    gain = 0
    loss = 0
    win_martingale = False
    
    if (result_before != None):
        if is_martingale:
            if (result_before == 'Loss'):
                num_soros = num_soros_original
                if num_martingale < 0: 
                    num_martingale = num_martingale_original

                hand_soros = 0
                agregated_value = 0
                if num_martingale > 0:
                    value *= martingale_coef
                    win_martingale = True
                num_martingale -= 1


        if (result_before == 'Win Martingale'):
            if num_martingale == 0 and not is_soros:
                num_martingale = num_martingale_original
        
        if (result_before == 'Win' or result_before == 'win'):
            if is_soros:
                hand_soros += 1
                num_soros -= 1
                agregated_value += profit_before
                num_martingale = num_martingale_original
                if (hand_soros == 6 or num_soros < 0):
                    hand_soros = 0
                    agregated_value = 0
                    num_soros = num_soros_original
                    num_martingale = num_martingale_original
                value = agregated_value

    signal = ConfigSignsList.get_signal_by_date()

    date = None
    hour = None
    currency = data['currency']
    type = data['type']
    duration_time = data['duration_time']

    error = data['error']
    show_message = True
    
    qtd_erro = 0
    executors_list = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=61) as executor:
        API = Authentication.login(False, email, password, mode, user_group_id)
        if duration_time != None and error == False:
            i = 1
            result = None
            profit = None
            
            arguments = [email, password, mode, user_group_id, value, currency, type, duration_time, date, API, num_soros, num_martingale, win_martingale]
            executors_list.append(executor.submit(StartOperation.buy, arguments))
        if signal != None:
            user = User.get_user_object(email)
            user_id = user.user_id 

            initiated_signal = InitiatedSignals.get_initiated_signal_object(user_id, signal.config_signs_list_id)
            if initiated_signal != None:
                result = None,
                profit = None
                show_message = False
                i = 3
            else:
                InitiatedSignals.add_initiated_signal(user_id, signal.config_signs_list_id)

                date = signal.date
                hour = signal.hour
                currency = signal.currency
                type = signal.type
                duration_time = int(signal.duration_time)

                result = None
                profit = None

                arguments = [email, password, mode, user_group_id, initial_value, currency, type, duration_time, date, API, num_soros_original, num_martingale_original, False]
                executors_list.append(executor.submit(StartOperation.buy, arguments))

                i = 4
        else:
            result = None,
            profit = None

    res = None

    executors_list_index = len(executors_list)-1
    
    res_array = []
    for operation in executors_list:
        result, profit, agregated_value_res, num_soros_res, num_martingale_res, currency_res, type_res, duration_time_res, win_martingale_res = operation.result()

        if profit != None:
            if signal != None and signal.date != None:
                date = str(signal.date)
            else:
                date = datetime.now() - timedelta(minutes=duration_time)
                hour = str(date.hour)
                if (len(hour) == 1):
                    hour = "0" + str(hour)
                minute = str(date.minute)
                if (len(minute) == 1):
                    minute = "0" + str(minute)
                hour = hour + ':' + minute
                date = str(date)

            if profit > 0:
                gain = profit
            else:
                loss = profit
        else:
            LogError.add_log_error(result, email, mode)
            error = True
            if show_message == True and  i == 1 and "Cannot purchase an option" in result:
                show_message = False
                qtd_erro = 1

        res = {
            "agregated_value": agregated_value_res,
            "result": result,
            "profit": profit,
            "hand_soros": hand_soros,
            "num_soros": num_soros_res,
            "num_martingale": num_martingale_res,
            "date": date,
            "hour": hour,
            "currency": currency_res,
            "type": type_res,
            "duration_time": duration_time_res,
            "gain": gain,
            "loss": loss,
            "error": error,
            "show_message": show_message,
            "win_martingale": win_martingale_res,
            "qtd_erro": qtd_erro
        }

        res_array.append(res)

    if show_message == False:
        time.sleep(3)

    return Response(json.dumps(res_array), 200, mimetype='application/json') """
""" End Config Params """


""" Begin Settings """
@app.route('/indexSettings', methods=['GET'])
def indexSettings():
    return jsonify({'settings': Settings.index_settings()})

@app.route('/updateAdmin', methods=['PATCH'])
def updateAdmin():
    return jsonify({'settings': Settings.update_admin()})

@app.route('/updateSystem', methods=['PATCH'])
def updateSystem():
    return jsonify({'settings': Settings.update_system()})
""" End Settings """

if __name__ == '__main__':
    #app.run(port=5000)
    #app.run(port=5000, debug=True)

    # Threaded option to enable multiple instances for multiple user access support
    #app.run(threaded=True, port=5000)
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)