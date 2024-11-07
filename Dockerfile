# Sử dụng hình ảnh Node.js phiên bản 20 LTS
FROM node:20

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép tệp package.json và package-lock.json
COPY package*.json ./

# Cài đặt các gói phụ thuộc
RUN npm install

RUN apt-get update && apt-get 

# Sao chép toàn bộ mã nguồn vào container
COPY . .
#dauma
# Chạy ứng dụng
CMD ["npm", "start"]
