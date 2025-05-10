import React, { useMemo, useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  isValueEmpty,
  valuesHaveErrors,
  emailValidationConfig,
  passwordValidationConfig,
  nameValidationConfig,
  phoneValidationConfig, 
  dniValidationConfig,
  handleChange,
  createAnUser,
} from '../../utils/';
import { ErrorMessage, Errors } from '../../components/ErrorMessage';
import { SnackBar } from '../../components';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES_KEYS,
  SUCCESS_MESSAGES,
  BAD_REQUEST,
} from '../../constants/';
import { useAuth, useLocalStorage } from '../../hooks';

interface RegisterState {
  name: string;
  lastName: string;
  phone: string;
  dni: string;
  email: string;
  password: string;
  passwordRepeated: string;
  showPassword: boolean;
}

interface RegisterInputs {
  name: string;
  lastName: string;
  phone: string;
  dni: string;
  email: string;
  password: string;
  passwordRepeated: string;
}

interface CreateUserResponse {
  accessToken?: string;
}

const messageDuration = 2000;

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<RegisterInputs>({
    criteriaMode: 'all',
  });

  const [token, setToken] = useLocalStorage('token');
  const { setIsAuthenticated } = useAuth();

  const [values, setValues] = React.useState<RegisterState>({
    email: '',
    password: '',
    name: '',
    lastName: '',
    phone: '',
    dni: '',
    passwordRepeated: '',
    showPassword: false,
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [message, setMessage] = useState('');

  const isEmpty = isValueEmpty(values);
  const hasErrors = useMemo(() => valuesHaveErrors(errors), [errors]);


  const onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    maxLength?: number
  ) => {
    console.log('Valores cambiados:', event.target.name, event.target.value); 
    handleChange<RegisterState>(event, setValues, maxLength);
  };

 
  useEffect(() => {
    console.log('Estado de los valores:', values);
  }, [values]);

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const onSubmit: SubmitHandler<RegisterInputs> = async ({
    name,
    lastName,
    password,
    phone,
    dni,
    email,
  }) => {
    setIsSubmiting(true);

    console.log('Datos enviados al backend:', { name, lastName, password, phone, dni, email }); 

    if (!createAnUser) {
      console.error('createAnUser no está disponible');
      setIsSubmiting(false);
      setIsError(true);
      setMessage('Error interno. Intenta más tarde.');
      return;
    }

    try {
      const response = await createAnUser({
        firstName: name,
        lastName,
        password,
        phone,
        dni,
        email,
      });

      if (!response) {
        throw new Error('No se pudo crear el usuario.');
      }

      const { accessToken } = response;

      if (accessToken) {
        setIsSuccess(true);
        setToken(accessToken);
        setMessage(SUCCESS_MESSAGES[SUCCESS_MESSAGES_KEYS.USER_REGISTER]);
        setTimeout(() => {
          setIsSubmiting(false);
          setIsAuthenticated(true);
        }, messageDuration);
      } else {
        setIsError(true);
        setMessage(ERROR_MESSAGES.INVALID_USER);
        setIsSubmiting(false);
      }
    } catch (error: any) {
      console.log(error);
      setIsError(true);
      setMessage(ERROR_MESSAGES.INVALID_USER);
      setIsSubmiting(false);
      if (error?.status === BAD_REQUEST) {
        setIsError(true);
      }
    }
  };

  return (
    <div className="tw-w-full tw-h-full tw-flex tw-flex-col tw-flex-1 tw-items-center tw-justify-center">
      <h2>Crear cuenta</h2>
      <div className="tw-flex tw-max-w-3xl">
        <form
          className="tw-flex tw-flex-wrap tw-gap-x-16 tw-gap-y-12 tw-mt-10 tw-bg-background tw-justify-between"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <FormControl variant="outlined">
              <InputLabel htmlFor="outlined-adornment-name">Nombre</InputLabel>
              <OutlinedInput
                id="outlined-adornment-name"
                type="text"
                value={values.name}
                {...register('name', nameValidationConfig)}
                onChange={onChange}
                label="nombre"
              />
            </FormControl>
            {errors.name && <ErrorMessage errors={errors.name as Errors} />}
          </div>
          <div>
            <FormControl variant="outlined">
              <InputLabel htmlFor="outlined-adornment-last-name">Apellido</InputLabel>
              <OutlinedInput
                id="outlined-adornment-last-name"
                type="text"
                value={values.lastName}
                {...register('lastName', nameValidationConfig)}
                onChange={onChange}
                label="lastName"
              />
            </FormControl>
            {errors.lastName && <ErrorMessage errors={errors.lastName as Errors} />}
          </div>
          <div>
            <FormControl variant="outlined">
              <InputLabel htmlFor="outlined-adornment-dni">DNI</InputLabel>
              <OutlinedInput
                id="outlined-adornment-dni"
                type="number"
                value={values.dni}
                {...register('dni', dniValidationConfig)}
                onChange={(event) => onChange(event, 8)}
                label="dni"
                autoComplete="off"
              />
            </FormControl>
            {errors.dni && <ErrorMessage errors={errors.dni as Errors} />}
          </div>
          <div>
            <FormControl variant="outlined">
              <InputLabel htmlFor="outlined-adornment-email">Correo</InputLabel>
              <OutlinedInput
                id="outlined-adornment-email"
                type="text"
                value={values.email}
                {...register('email', emailValidationConfig)}
                onChange={onChange}
                label="email"
              />
            </FormControl>
            {errors.email && <ErrorMessage errors={errors.email as Errors} />}
          </div>
          <div>
            <FormControl variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">Contraseña</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={values.showPassword ? 'text' : 'password'}
                value={values.password}
                {...register('password', passwordValidationConfig)}
                onChange={onChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {values.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
                autoComplete="off"
              />
            </FormControl>
            {errors.password && <ErrorMessage errors={errors.password as Errors} />}
          </div>
          <div>
            <FormControl variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password-repeated">Confirmar contraseña</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password-repeated"
                type={values.showPassword ? 'text' : 'password'}
                value={values.passwordRepeated}
                {...register('passwordRepeated', {
                  validate: (value: string) => {
                    if (watch('password') !== value) {
                      return ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH;
                    }
                  },
                })}
                onChange={onChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {values.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
                autoComplete="off"
              />
            </FormControl>
            {errors.passwordRepeated && (
              <ErrorMessage errors={errors.passwordRepeated as Errors} />
            )}
          </div>
          <div>
            <FormControl variant="outlined">
              <InputLabel htmlFor="outlined-adornment-phone">Teléfono</InputLabel>
              <OutlinedInput
                id="outlined-adornment-phone"
                type="number"
                value={values.phone}
                {...register('phone', phoneValidationConfig)} 
                onChange={onChange}
                label="phone"
              />
            </FormControl>
            {errors.phone && <ErrorMessage errors={errors.phone as Errors} />}
          </div>
          <div className="tw-w-full tw-flex tw-justify-center">
            <Button
              className={`tw-h-14 tw-w-80 ${
                hasErrors || !isDirty || isEmpty || isSubmiting
                  ? 'tw-text-neutral-gray-300 tw-border-neutral-gray-300 tw-cursor-not-allowed'
                  : 'tw-text-white tw-border-primary tw-bg-primary'
              }`}
              variant="outlined"
              type="submit"
              disabled={hasErrors || !isDirty || isEmpty || isSubmiting}
            >
              Crear cuenta
            </Button>
          </div>
        </form>
      </div>

      <SnackBar
        duration={messageDuration}
        message={message}
        type={isError ? 'error' : 'success'}
      />
    </div>
  );
};

export default Register;


