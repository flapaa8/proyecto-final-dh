import { UserAccount, User, Transaction, Card } from '../../types';

const USERS_SERVICE_URL = 'http://localhost:3500';
const ACCOUNTS_SERVICE_URL = 'http://localhost:3600';
const CARDS_SERVICE_URL = 'http://localhost:3602';

const myInit = (method = 'GET', token?: string) => {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    mode: 'cors' as RequestMode,
    cache: 'default' as RequestCache,
  };
};

const myRequest = (endpoint: string, method: string, token?: string) =>
  new Request(endpoint, myInit(method, token));

const rejectPromise = (response?: Response): Promise<Response> =>
  Promise.reject({
    status: (response && response.status) || '00',
    statusText: (response && response.statusText) || 'Ocurrió un error',
    err: true,
  });

export const login = (email: string, password: string) => {
  return fetch(myRequest(`${USERS_SERVICE_URL}/users/login`, 'POST'), {
    body: JSON.stringify({ email, password }),
  })
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const createAnUser = (user: User) => {
  if (!user.firstName || !user.lastName) {
    return Promise.reject(new Error('Nombre y apellido obligatorios.'));
  }

  const userForBackend = {
    NyAP: `${user.firstName} ${user.lastName}`,
    dni: user.dni,
    email: user.email,
    telefono: user.phone,
    password: user.password,
  };

  return fetch(`${USERS_SERVICE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userForBackend),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then(errData => {
          return Promise.reject({
            status: response.status,
            statusText: response.statusText,
            data: errData,
            err: true,
          });
        });
      }
      return response.json();
    })
    .catch((error) => {
      throw error;
    });
};

export const getUser = (id: string): Promise<User> => {
  return fetch(myRequest(`${USERS_SERVICE_URL}/users/${id}`, 'GET'))
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const updateUser = (
  id: string,
  data: any,
  token: string
): Promise<Response> => {
  return fetch(myRequest(`${USERS_SERVICE_URL}/users/${id}`, 'PATCH', token), {
    body: JSON.stringify(data),
  })
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const createAnAccount = (data: any): Promise<Response> => {
  const { user, accessToken } = data;

  const account = {
    balance: 0,
    name: `${user.firstName} ${user.lastName}`,
    userId: user.id,
  };

  return fetch(
    myRequest(`${ACCOUNTS_SERVICE_URL}/accounts`, 'POST', accessToken),
    {
      body: JSON.stringify(account),
    }
  )
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const getAccount = (id: string, token: string): Promise<UserAccount> => {
  return fetch(myRequest(`${ACCOUNTS_SERVICE_URL}/accounts/${id}`, 'GET', token))
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const getAccounts = (): Promise<UserAccount[]> => {
  return fetch(myRequest(`${ACCOUNTS_SERVICE_URL}/accounts`, 'GET'))
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const updateAccount = (
  id: string,
  data: any,
  token: string
): Promise<Response> => {
  return fetch(
    myRequest(`${ACCOUNTS_SERVICE_URL}/accounts/${id}`, 'PATCH', token),
    {
      body: JSON.stringify(data),
    }
  )
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const getUserActivities = (
  userId: string,
  token: string
): Promise<Transaction[]> => {
  return fetch(
    myRequest(`${ACCOUNTS_SERVICE_URL}/accounts/${userId}/activity`, 'GET', token)
  )
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const getUserActivity = (
  userId: string,
  activityId: string,
  token: string
): Promise<Transaction> => {
  return fetch(
    myRequest(`${ACCOUNTS_SERVICE_URL}/accounts/${userId}/activity/${activityId}`, 'GET', token)
  )
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const getUserCards = (
  userId: string,
  token: string
): Promise<Card[]> => {
  return fetch(myRequest(`${CARDS_SERVICE_URL}/cards/${userId}`, 'GET', token))
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const getUserCard = (userId: string, cardId: string): Promise<Card> => {
  return fetch(myRequest(`${CARDS_SERVICE_URL}/cards/${userId}/${cardId}`, 'GET'))
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const deleteUserCard = (
  userId: string,
  cardId: string,
  token: string
): Promise<Response> => {
  return fetch(
    myRequest(`${CARDS_SERVICE_URL}/cards/${userId}/${cardId}`, 'DELETE', token)
  )
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const createUserCard = (
  userId: string,
  card: any,
  token: string
): Promise<Response> => {
  return fetch(myRequest(`${CARDS_SERVICE_URL}/cards/${userId}`, 'POST', token), {
    body: JSON.stringify(card),
  })
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const createDepositActivity = (
  userId: string,
  amount: number,
  token: string
) => {
  const maxAmount = 30000;
  if (amount > maxAmount) return rejectPromise();

  const activity = {
    amount,
    type: 'Deposit',
    description: 'Depósito con tarjeta',
    dated: new Date(),
  };

  return fetch(
    myRequest(`${ACCOUNTS_SERVICE_URL}/accounts/${userId}/activity`, 'POST', token),
    {
      body: JSON.stringify(activity),
    }
  )
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const createTransferActivity = (
  userId: string,
  token: string,
  origin: string,
  destination: string,
  amount: number,
  name?: string
) => {
  return fetch(
    myRequest(`${ACCOUNTS_SERVICE_URL}/accounts/${userId}/activity`, 'POST', token),
    {
      body: JSON.stringify({
        type: 'Transfer',
        amount: amount * -1,
        origin,
        destination,
        name,
        dated: new Date(),
      }),
    }
  )
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};
