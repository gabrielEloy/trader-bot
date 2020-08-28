from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey, and_
from datetime import datetime, timedelta

from settings import app
import json
from crypto import *

db = SQLAlchemy(app)
class UserGroup(db.Model):
    user_group_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(250), unique=True)

    def __repr__(self):
        return '<UserGroup %r>' % self.name


class ConfigSignsList(db.Model):
    config_signs_list_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date = db.Column(db.DateTime)
    hour = db.Column(db.String(5))
    duration_time = db.Column(db.Integer)
    currency = db.Column(db.String(10))
    type = db.Column(db.String(4))

    def json(self):
        return {
            'config_signs_list_id': self.config_signs_list_id,
            'date': self.date,
            'hour': self.hour,
            'duration_time': str(self.duration_time) + ' minutos',
            'currency': self.currency,
            'type': self.type,
        }

    def index_signal():
        return [ConfigSignsList.json(signal) for signal in ConfigSignsList.query.all()]

    def get_signal_by_date():
        date = datetime.now()
        date = datetime(date.year, date.month, date.day, date.hour, date.minute)
        return ConfigSignsList.query.filter(ConfigSignsList.date >= date).order_by(ConfigSignsList.date).first()

    def add_signal(_date, _hour, _duration_time, _currency, _type):
        try:
            new_signal = ConfigSignsList(date = _date, hour = _hour, duration_time = _duration_time, currency = _currency, type = _type)
            new_signal.date = datetime.strptime(new_signal.date, '%Y-%m-%d')
            hour = int(_hour.split(':')[0])  
            minute = int(_hour.split(':')[1])            
            new_signal.date = new_signal.date + timedelta(hours = hour)
            new_signal.date = new_signal.date + timedelta(minutes = minute)

            db.session.add(new_signal)
            db.session.commit()

            return {
                "type": "success",
                "message": "Sinal Inserido com sucesso!"
            }
        except Exception as ex:
            return {
                "type": "error",
                "message": "Ocorreu um erro ao inserir o sinal."
            }

    def delete_signal(_config_signs_list_id):
        try:
            InitiatedSignals.query.filter_by(config_signs_list_id=_config_signs_list_id).delete()
            ConfigSignsList.query.filter_by(config_signs_list_id=_config_signs_list_id).delete()
            db.session.commit()
            
            return {
                "type": "success",
                "message": "Sinal excluído com sucesso!"
            }
        except Exception as ex:
            return {
                "type": "error",
                "message": "Ocorreu um erro ao excluir o sinal."
            }

    def delete_all_signal():
        try:
            InitiatedSignals.query.delete()
            ConfigSignsList.query.delete()
            db.session.commit()
            
            return {
                "type": "success",
                "message": "Sinais excluídos com sucesso!"
            }
        except Exception as ex:
            return {
                "type": "error",
                "message": "Ocorreu um erro ao excluir os sinais."
            }

    def __repr__(self):
        return '<Config Signs List Id %r>' % self.config_signs_list_id

class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(250), unique=True)
    password = db.Column(db.String(64), nullable=True)
    active = db.Column(db.Boolean)
    user_group_id = db.Column(db.Integer, ForeignKey('user_group.user_group_id'))

    def json(self):
        return {'user_id': self.user_id, 'email': self.email, 'active': self.active, 'user_group_id': self.user_group_id}

    def index_users(_user_group_id):
        if _user_group_id == 'null':
            return [User.json(user) for user in User.query.all()]
        
        return [User.json(user) for user in User.query.filter_by(user_group_id=_user_group_id).all()]

    def get_user(_email, _user_group_id):
        if (_user_group_id != None):
            user = User.query.filter_by(email=_email, user_group_id=_user_group_id).first()
        else:
            user = User.query.filter_by(email=_email).first()

        if user != None:
            return User.json(user)
        
        return None

    def get_user_object(_email):
        return User.query.filter_by(email=_email).first()

    def add_user(_email, _password, _user_group_id):
        try:
            new_user = User(email = _email, password = _password, active = True, user_group_id = _user_group_id)

            db.session.add(new_user)
            db.session.commit()

            return {
                "type": "success",
                "message": "Usuário Inserido com sucesso!"
            }
        except Exception as ex:
            print(ex)
            return {
                "type": "error",
                "message": "Ocorreu um erro ao inserir o usuário."
            }

    def update_user_status(_email):
        try:
            user = User.query.filter_by(email=_email).first()
            user.active = not user.active
            db.session.commit()
            return {
                "type": "success", 
                "active": user.active
            }
        except Exception as ex:
            return {
                "type": "error",
                "message": "Ocorreu um erro ao atualizar o status do usuário."
            }
        
    def delete_user(_email):
        try:
            User.query.filter_by(email=_email).delete()
            db.session.commit()
            return {
                "type": "success",
                "message": "Usuário excluído com sucesso!"
            }
        except Exception as ex:
            print(ex)
            return {
                "type": "error",
                "message": "Ocorreu um erro ao excluir o usuário."
            }

    def verify_platform_status(_email, _password):
        user = User.get_user_object(_email)
        settings = Settings.query.first()

        # verify if emails is registered in platform
        if (user == None):
            return {
                "type": "error",
                "message": "Este e-mail não está cadastrado na plataforma."
            }
        # verify if user is system
        elif (user.user_group_id == 1):
            crypted_password = doEncode(_password)
            if (user.password == crypted_password):
                return {
                    "type": "success",
                    "message": "Conectado com sucesso!",
                    "id": user.user_group_id
                }
            else:
                return {
                    "type": "error",
                    "message": "Senha Incorreta!"
                }
        # verify if email is enabled
        elif (user.active == False):
            return {
                "type": "error",
                "message": "Este e-mail foi inativado pelo Administrador."
            }
        # verify if software is enabled (super admin and admin)
        elif (settings.locked_by_system == True and (user.user_group_id == 2 or user.user_group_id == 3)):
            return {
                "type": "error",
                "message": "O sistema foi bloqueado pelo desenvolvedor."
            }
        # verify if software is enabled
        elif (settings.locked_by_admin == True and user.user_group_id != 1 and user.user_group_id != 2):
            return {
                "type": "error",
                "message": "O sistema foi bloqueado pelo Super Admin."
            }        

        return True

    def __repr__(self):
        return '<Email user %r>' % self.email

class ConfigParams(db.Model):
    __tablename_ = 'config_params'
    config_params_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    martingale_coef = db.Column(db.Numeric(4,2), nullable=True)
    num_martingale = db.Column(db.Integer, nullable=True)
    num_soros = db.Column(db.Integer, nullable=True)
    stop_loss = db.Column(db.Integer, nullable=True)
    stop_gain = db.Column(db.Integer, nullable=True)
    initial_value = db.Column(db.Numeric(9,2), nullable=True)
    delay_operation = db.Column(db.Integer, nullable=True)
    delay_martingale = db.Column(db.Integer, nullable=True)
    is_martingale = db.Column(db.Boolean)
    is_soros = db.Column(db.Boolean)
    user_id = db.Column(db.Integer, ForeignKey('user.user_id'))

    def json(self):
        return {
            'config_params_id': self.config_params_id
            ,'martingale_coef': str(self.martingale_coef)
            ,'num_martingale': self.num_martingale
            ,'num_soros': self.num_soros
            ,'stop_loss': self.stop_loss
            ,'stop_gain': self.stop_gain
            ,'initial_value': str(self.initial_value)
            ,'delay_operation': self.delay_operation
            ,'delay_martingale': self.delay_martingale
            ,'is_martingale': self.is_martingale
            ,'is_soros': self.is_soros
            ,'user_id': self.user_id
        }

    def index_configuration(_user_id):
        return [ConfigParams.json(config) for config in ConfigParams.query.filter_by(user_id=_user_id).all()]

    def add_config_params(_martingale_coef
    , _num_martingale
    , _num_soros
    , _stop_loss
    , _stop_gain
    , _initial_value
    , _delay_operation
    , _delay_martingale
    , _is_martingale
    , _is_soros
    , _user_id
    , _is_new):

        try:
            new_config_params = ConfigParams(
                martingale_coef = _martingale_coef 
                , num_martingale = _num_martingale
                , num_soros = _num_soros
                , stop_loss = _stop_loss
                , stop_gain = _stop_gain
                , initial_value = _initial_value
                , delay_operation = _delay_operation
                , delay_martingale = _delay_martingale
                , is_martingale = _is_martingale
                , is_soros = _is_soros
                , user_id = _user_id
            )

            if _is_new:
                db.session.add(new_config_params)
            else:
                config_params = ConfigParams.query.filter_by(user_id=_user_id).first()
                config_params.martingale_coef = _martingale_coef
                config_params.num_martingale = _num_martingale
                config_params.num_soros = _num_soros
                config_params.stop_loss = _stop_loss
                config_params.stop_gain = _stop_gain
                config_params.initial_value = _initial_value
                config_params.delay_operation = _delay_operation
                config_params.delay_martingale = _delay_martingale
                config_params.is_martingale = _is_martingale
                config_params.is_soros = _is_soros
                
            db.session.commit()

            return {
                "type": "success", 
                "message": "Configurações salvas com sucesso!"
            }
        except Exception as ex:
            operationType = "atualizar"
            if _is_new:
                operationType = "inserir"
            return {
                "type": "error",
                "message": "Ocorreu um erro ao " + operationType + " as configurações."
            }

        
    def __repr__(self):
        return '<Config Params Id %r>' % self.config_params_id

class Settings(db.Model):
    settings_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    locked_by_admin = db.Column(db.Boolean)
    locked_by_system = db.Column(db.Boolean)
    obs = db.Column(db.String(250), nullable=True)

    def json(self):
        return {
            'settings_id': self.settings_id
            , 'locked_by_admin': self.locked_by_admin
            , 'locked_by_system': self.locked_by_system
            , 'obs': self.obs
        }

    def index_settings():
        return Settings.json(Settings.query.first())

    def update_admin():
        try:
            settings = Settings.query.first()
            status = not settings.locked_by_admin
            settings.locked_by_admin = status
            
            message = "Sistema desbloqueado com sucesso!"
            if (status):
                message = "Sistema bloqueado com sucesso!"

            db.session.commit()
            return {
                "type": "success", 
                "blocked": settings.locked_by_admin,
                "message": message
            }
        except Exception as ex:
            return {
                "type": "error",
                "message": "Ocorreu um erro ao bloquear/desbloquear o sistema."
            }

    def update_system():
        try:
            settings = Settings.query.first()
            status = not settings.locked_by_system
            settings.locked_by_system = status
            settings.locked_by_admin = status
            db.session.commit()
            
            message = "Sistema desbloqueado com sucesso!"
            if (status):
                message = "Sistema bloqueado com sucesso!"

            return {
                "type": "success", 
                "blocked": settings.locked_by_system,
                "message": message
            }
        except Exception as ex:
            return {
                "type": "error",
                "message": "Ocorreu um erro ao bloquear/desbloquear o sistema.",
                "exception": ex
            }

    def __repr__(self):
        return '<Settings Id %r>' % self.settings_id

class LogError(db.Model):
    log_error_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    date = db.Column(db.DateTime)
    message = db.Column(db.String())
    email = db.Column(db.String(250), nullable=True) 
    mode = db.Column(db.Boolean, nullable=True)

    def add_log_error(_message, _email, _mode):
        if _mode != None:
            _mode = eval(_mode.title())
            
        new_log_error = LogError (date = datetime.now(), message = _message, email = _email, mode = _mode)
        db.session.add(new_log_error)
        db.session.commit()

    def __repr__(self):
        return '<LogError Id %r>' % self.log_error_id
    
class InitiatedSignals(db.Model):
    initiated_signals_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, ForeignKey('user.user_id'))
    config_signs_list_id = db.Column(db.Integer, ForeignKey('config_signs_list.config_signs_list_id'))

    def get_initiated_signal_object(_user_id, _config_signs_list_id):
        return InitiatedSignals.query.filter(and_(InitiatedSignals.user_id == _user_id, InitiatedSignals.config_signs_list_id == _config_signs_list_id)).first()

    def add_initiated_signal(_user_id, _config_signs_list_id):
        new_initiated_signal = InitiatedSignals(user_id = _user_id, config_signs_list_id = _config_signs_list_id)
        db.session.add(new_initiated_signal)
        db.session.commit()

    def __repr__(self):
        return '<InitiatedSignals Id %r>' % self.initiated_signals_id