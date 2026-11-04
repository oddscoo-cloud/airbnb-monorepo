FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY Airbnb.Api/Airbnb.Api.csproj Airbnb.Api/
RUN dotnet restore Airbnb.Api/Airbnb.Api.csproj
COPY Airbnb.Api/ Airbnb.Api/
RUN dotnet publish Airbnb.Api/Airbnb.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Airbnb.Api.dll"]
