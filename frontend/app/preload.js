const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getClients: () => ipcRenderer.invoke('get-clients'),
  addClient: (client) => ipcRenderer.invoke('add-client', client),
  getLoans: (clientId) => ipcRenderer.invoke('get-loans', clientId),
  addLoan: (loan) => ipcRenderer.invoke('add-loan', loan)
});
