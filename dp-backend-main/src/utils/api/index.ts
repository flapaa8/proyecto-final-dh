import { UserAccount, User, Transaction, Card } from '../../types';

const USERS_SERVICE_URL = 'http://localhost:3500';
const ACCOUNTS_SERVICE_URL = 'http://localhost:3600';
const CARDS_SERVICE_URL = 'http://localhost:3602';

const myInit = (method = 'GET', token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  console.log("myInit crea headers:", headers);

  return {
    method,
    headers,
    mode: 'cors' as RequestMode,
    cache: 'default' as RequestCache,
  };
};

const myRequest = (endpoint: string, method: string, token?: string) =>
  new Request(endpoint, myInit(method, token));

const rejectPromise = (response?: Response | any): Promise<any> =>
  Promise.reject({
    status: (response && response.status) || '00',
    statusText: (response && response.statusText) || 'Ocurrió un error',
    err: true,
  });

/**
 * LOGIN
 */
export const login = (email: string, password: string) => {
  return fetch(`${USERS_SERVICE_URL}/users/login`, {
    ...myInit('POST'),
    body: JSON.stringify({ email, password }),
  })
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

/**
 * CREATE USER
 */
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
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al registrar usuario');
      }

      const data = await response.json();
      console.log('✅ REGISTER RESPONSE:', data);

      if (data.accessToken && data.usuario) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.usuario));
      }

      return data;
    })
    .catch((error) => {
      console.error('❌ Error en createAnUser:', error);
      throw error;
    });
};

/**
 * GET USER (con token en Authorization)
 */
export const getUser = (id: string): Promise<User> => {
  const token = localStorage.getItem('token') || '';
  return fetch(myRequest(`${USERS_SERVICE_URL}/users/${id}`, 'GET', token))
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

/**
 * UPDATE USER
 */
export const updateUser = (
  id: string,
  data: any,
  token: string
): Promise<User> => {
  return fetch(myRequest(`${USERS_SERVICE_URL}/users/${id}`, 'PATCH', token), {
    body: JSON.stringify(data),
  })
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

/**
 * ACCOUNTS
 */
const generateCvu = (): string => {
  let cvu = '';
  for (let i = 0; i < 22; i++) {
    cvu += Math.floor(Math.random() * 10);
  }
  return cvu;
};

const generateAlias = (): string => {
  const words = [
    'Cuenta', 'Personal', 'Banco', 'Argentina', 'Digital', 'Money', 'House',
    'Bank', 'Account', 'Cartera', 'Wallet', 'Pago', 'Pay', 'Rapido', 'Seguro',
  ];
  return Array.from({ length: 3 }, () => words[Math.floor(Math.random() * words.length)]).join('.');
};

export const createAnAccount = (data: any): Promise<UserAccount> => {
  const { user, accessToken } = data;

  const alias = generateAlias();
  const cvu = generateCvu();

  const account = {
    alias,
    cvu,
    balance: 0,
    name: `${user.firstName} ${user.lastName}`,
    userId: user.id,
  };

  return fetch(myRequest(`${ACCOUNTS_SERVICE_URL}/accounts`, 'POST', accessToken), {
    body: JSON.stringify(account),
  })
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const getAccount = (id: string, token: string): Promise<UserAccount> => {
  const request = myRequest(`${ACCOUNTS_SERVICE_URL}/accounts/user/${id}`, 'GET', token);
  console.log("Llamando a getAccount con URL:", request.url);
  return fetch(request)
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
): Promise<UserAccount> => {
  return fetch(myRequest(`${ACCOUNTS_SERVICE_URL}/accounts/${id}`, 'PATCH', token), {
    body: JSON.stringify(data),
  })
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const getUserActivities = (
  userId: string,
  token: string
): Promise<Transaction[]> => {
  return fetch(myRequest(`${ACCOUNTS_SERVICE_URL}/accounts/${userId}/activity`, 'GET', token))
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const getUserActivity = (
  userId: string,
  activityId: string,
  token: string
): Promise<Transaction> => {
  return fetch(myRequest(`${ACCOUNTS_SERVICE_URL}/accounts/${userId}/activity/${activityId}`, 'GET', token))
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

/**
 * CARDS
 */
export const getUserCards = (
  userId: string,
  token: string
): Promise<Card[]> => {
  return fetch(myRequest(`${CARDS_SERVICE_URL}/cards/${userId}`, 'GET', token))
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const getUserCard = (
  userId: string,
  cardId: string,
  token: string
): Promise<Card> => {
  return fetch(myRequest(`${CARDS_SERVICE_URL}/cards/${userId}/${cardId}`, 'GET', token))
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const deleteUserCard = (
  userId: string,
  cardId: string,
  token: string
): Promise<Response> => {
  return fetch(myRequest(`${CARDS_SERVICE_URL}/cards/${userId}/${cardId}`, 'DELETE', token))
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

export const createUserCard = (
  userId: string,
  card: any,
  token: string
): Promise<Card> => {
  return fetch(myRequest(`${CARDS_SERVICE_URL}/cards/${userId}`, 'POST', token), {
    body: JSON.stringify(card),
  })
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};

/**
 * ACTIVITIES
 */
export const createDepositActivity = (
  userId: string,
  amount: number,
  token: string
): Promise<Transaction> => {
  const maxAmount = 30000;
  if (amount > maxAmount) return rejectPromise();

  const activity = {
    amount,
    type: 'Deposit',
    description: 'Depósito con tarjeta',
    dated: new Date(),
  };

  return fetch(myRequest(`${ACCOUNTS_SERVICE_URL}/accounts/${userId}/activity`, 'POST', token), {
    body: JSON.stringify(activity),
  })
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
): Promise<Transaction> => {
  const activity = {
    type: 'Transfer',
    amount: amount * -1,
    origin,
    destination,
    name,
    dated: new Date(),
  };

  return fetch(myRequest(`${ACCOUNTS_SERVICE_URL}/accounts/${userId}/activity`, 'POST', token), {
    body: JSON.stringify(activity),
  })
    .then((response) => (response.ok ? response.json() : rejectPromise(response)))
    .catch((err) => rejectPromise(err));
};
