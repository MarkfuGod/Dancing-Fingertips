from datetime import datetime

class sys_time:
    def __init__(self):
        self.time = 0

    def get_time(self):
        self.time = datetime.now()
        self.time = self.time.strftime("%m-%d")