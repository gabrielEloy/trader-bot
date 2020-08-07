from flask import Flask
import json

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://hydracorp:Hydracorp4321@automation-operations.cybhc7wz49jo.sa-east-1.rds.amazonaws.com/automation_operations"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_pre_ping':True}