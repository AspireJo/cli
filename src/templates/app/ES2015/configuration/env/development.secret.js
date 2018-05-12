module.exports = {
  locales: {
    US: {
      dbConfig: {
        user: '<%- DB_USERNAME %>',
        password: '<%- DB_PASSWORD %>',
        dataSource: '<%- DB_DATASOURCE %>',
        connectionLifetime: 600,
      },
    },
  }
};
