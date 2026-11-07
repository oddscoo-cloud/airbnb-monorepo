FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY Airbnb.Api/Airbnb.Api.csproj Airbnb.Api/
COPY Airbnb.Application/Airbnb.Application.csproj Airbnb.Application/
COPY Airbnb.Domain/Airbnb.Domain.csproj Airbnb.Domain/
COPY Airbnb.Infrastructure/Airbnb.Infrastructure.csproj Airbnb.Infrastructure/
RUN dotnet restore Airbnb.Api/Airbnb.Api.csproj
COPY Airbnb.Api/ Airbnb.Api/
COPY Airbnb.Application/ Airbnb.Application/
COPY Airbnb.Domain/ Airbnb.Domain/
COPY Airbnb.Infrastructure/ Airbnb.Infrastructure/
RUN dotnet publish Airbnb.Api/Airbnb.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Airbnb.Api.dll"]
