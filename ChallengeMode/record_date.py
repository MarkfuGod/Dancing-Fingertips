from datetime import datetime


class sys_date:
    def __init__(self):
        self.time = 0

    def get_date(self):
        self.time = datetime.now()
        self.time = self.time.strftime("%m-%d")
        return self.time
