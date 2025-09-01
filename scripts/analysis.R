library(readr)
data <- read_csv("../backend/train_delay_data.csv")
summary(data)
plot(data$Delay_Minutes, main="Train Delay Distribution", col="blue")

