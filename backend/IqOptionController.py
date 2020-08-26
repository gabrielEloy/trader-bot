from flask import Flask
from iqoptionapi.stable_api import IQ_Option
from datetime import datetime
class Authentication():
    def login(first_access, email, password, mode, user_group_id):
        error_password="""{"code":"invalid_credentials","message":"You entered the wrong credentials. Please check that the login/password is correct."}"""
    
        API = IQ_Option(email, password)
        API.connect()
        check, reason = API.connect()

        print(check)
        print(reason)

        if check:
            while True: 
                if API.check_connect() == False:#detect the websocket is close
                        check, reason = API.connect()

                        if check:
                            Authentication.balance_type(API, mode)

                            if (first_access):
                                balance = API.get_balance()
                                return {
                                    "type": "success",
                                    "message": "Reconectado com Sucesso",
                                    "id": user_group_id,
                                    "email": email,
                                    "password": password,
                                    "mode": mode,
                                    "balance": balance
                                }
                            else:
                                return API
                        else:
                            if reason == error_password:
                                return {
                                    "type": "error",
                                    "message": "Email ou Senha Incorretos"
                                }
                            else:
                                return {
                                    "type": "error",
                                    "message": "Verifique sua internet ou entre em contato com a IQOption"
                                }
                else:
                    Authentication.balance_type(API, mode)

                    if (first_access):
                        balance = API.get_balance()
                        return {
                            "type": "success",
                            "message": "Conectado com sucesso!",
                            "id": user_group_id,
                            "email": email,
                            "password": password,
                            "mode": mode,
                            "balance": balance
                        }
                    else:
                        return API
                    break
        else:
            if reason == "[Errno -2] Name or service not known":
                return {
                    "type": "error",
                    "message": "Verifique sua internet ou entre em contato com a IQOption"
                }
            elif reason == error_password:
                return {
                    "type": "error",
                    "message": "Email ou Senha Incorretos"
                }

    def balance_type(API, mode):
        if (mode == True):
            API.change_balance('REAL') # PRACTICE / REAL
        else:
            API.change_balance('PRACTICE')


class StartOperation():
    # def buy(_email, _password, _mode, _user_group_id, _value, _currency, _type, _duration_time, _date):
    def buy(params):
        print('params', params)
        date_is_greather_than_now = True
        API = params["API"]
        plays = params["plays"]

        agregated_value=[]
        currency=[]
        type=[]
        duration_time=[]

        for play in plays:
            agregated_value.append(play["agregated_value"])
            currency.append(play["currency"])
            type.append(play["type"])
            duration_time.append(play["expiration"])

        buy_response = API.buy_multi(agregated_value, currency, type, duration_time)
        
        return {
            "type": 'success',
            "id": buy_response,
        }, 200


        
        """ while date_is_greather_than_now:
            _date = params['date']
            if (_date == None or (_date.now().date() == _date.date() and datetime.now().hour >= _date.hour and datetime.now().minute >= _date.minute)):
                date_is_greather_than_now = False """
        
        """ agregated_value = int(params['initial_value'])
        currency = params['currency']
        type = params['type']
        print("type", type)
        duration_time = params['duration_time']
        duration_time = 1

        while API == None:
            API = Authentication.login(False, params['email'], params['password'], params['mode'], params['user_group_id'])

        buy_response = API.buy(agregated_value, currency, type, duration_time)

        if buy_response[0] == False:
            return {
                "type": 'error',
                "message": buy_response[1]
            }, 400
        
        return {
            "type": 'success',
            "id": buy_response[1],
            "resto": buy_response
        }, 200
 """
        
