import { IRecord } from '../../components';

export const parseRecordContent = (record: any, variant: any): IRecord => {
  return {
    content: { ...record },
    variant,
  };
};

export function parseJwt(token: string | undefined) {
  if (!token || typeof token !== 'string' || token.split('.').length < 3) {
    console.log("Token no proporcionado, inválido o mal formado");
    return null;
  }

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.log("Error al procesar el token JWT:", error);
    return null;
  }
}

