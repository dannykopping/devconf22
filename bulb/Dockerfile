FROM python:3

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .


ARG email
ARG password
ENV MEROSS_EMAIL=${email}
ENV MEROSS_PASSWORD=${password}

EXPOSE 80

CMD [ "python", "api.py" ]