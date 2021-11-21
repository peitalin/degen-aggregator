# This docker file is intended for release / deployment, since it excludes packages and config files
# that are only needed during development.

FROM node:14-slim


WORKDIR /app


# Add global installation layers
RUN npm install typescript -g
RUN npm install nodemon -g



# ######### Chromium + Puppeteer
# RUN apt-get update \
#     && apt-get install -y wget gnupg \
#     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#     && apt-get update \
#     && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
#       --no-install-recommends \
#     && rm -rf /var/lib/apt/lists/*



RUN apt-get update && apt-get install -y chromium
# Uncomment to skip the chromium download when installing puppeteer. If you do,
# you'll need to launch puppeteer with:
#     browser.launch({executablePath: 'google-chrome-stable'})
RUN ls /usr/bin/chromium
RUN which chromium
# symlinnk chromium to chromium-browser in case puppeteer M1 mac hardcodes path
# to chromium-browser
RUN ln -s /usr/bin/chromium /usr/bin/chromium-browser

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium

RUN echo $(ls /usr/bin/chromium)
RUN echo $(which chromium)
RUN echo $PUPPETEER_EXECUTABLE_PATH

####### Chromium X Display Bug
# https://stackoverflow.com/questions/60304251/unable-to-open-x-display-when-trying-to-run-google-chrome-on-centos-rhel-7-5
RUN apt-get install -y xvfb
RUN apt-get -y install xorg xvfb gtk2-engines-pixbuf
RUN apt-get -y install dbus-x11 xfonts-base xfonts-100dpi xfonts-75dpi xfonts-cyrillic xfonts-scalable
RUN apt-get -y install imagemagick x11-apps
RUN Xvfb -ac :99 -screen 0 1280x1024x16 &
# RUN export DISPLAY=:99
ENV DISPLAY :99

# for https
RUN apt-get install -yyq ca-certificates
# install libraries
RUN apt-get install -yyq libappindicator1 libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6
# tools
RUN apt-get install -yyq gconf-service lsb-release wget xdg-utils
# and fonts
RUN apt-get install -yyq fonts-liberation


# Add npm packages layer
COPY ./package* ./
RUN npm install

# Copy required application files
COPY ./src ./src
COPY ./keys ./keys
COPY ./tsconfig.json .
COPY ./nodemon.json .
COPY ./jest.config.js .
COPY ./checkHealth.js .
# Compile
RUN npm run build

# Indicate that this image expects to accept traffic internally on this port.
# NOTE: Expose doesn't do anything, it's just documenting that this port is hardcoded internally
# and you'll want to map a host port to this value.
EXPOSE 80

## Define the health check
# HEALTHCHECK --start-period=30s CMD node /app/checkHealth.js

###########################################
### Run the web service on container startup.
CMD [ "npm", "run", "start" ]
# CMD ["npm", "run", "docker-entrypoint-debug"]

