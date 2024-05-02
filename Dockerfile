# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy all files except node_modules and mysqldata directories to the working directory
COPY . .

# Start the Express server
CMD ["node", "index.js"]