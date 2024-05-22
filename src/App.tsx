import React, { useState, useCallback, useMemo, useRef } from "react";

const URL = "https://jsonplaceholder.typicode.com/users";

// Типы данных для пользователя и компании
type Company = {
  bs: string;
  catchPhrase: string;
  name: string;
};

interface Address {
  street: string,
  suite: string,
  city: string,
  zipcode: string,
  geo: {
    lat: string,
    lng: string
  }
}

type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  username: string;
  website: string;
  company: Company;
  address: Address;
};

// Пропсы для компонента Button
interface IButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

// Компонент Button с мемоизацией для оптимизации производительности
const Button = React.memo(({ onClick }: IButtonProps): JSX.Element => {
  return (
    <button type="button" onClick={onClick}>
      Get Random User
    </button>
  );
});

// Пропсы для компонента UserInfo
interface IUserInfoProps {
  user: User | null;
}

// Компонент UserInfo с мемоизацией для оптимизации производительности
const UserInfo = React.memo(({ user }: IUserInfoProps): JSX.Element => {
  if (!user) return <div>not found</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Phone Number</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{user.name}</td>
          <td>{user.phone}</td>
        </tr>
      </tbody>
    </table>
  );
});

// Кастомный хук useThrottle для ограничения частоты вызова функции
const useThrottle = (callback: (...args: any[]) => void, delay: number) => {
  const lastCall = useRef<number>(0);

  return useCallback(
    (...args) => {
      const now = new Date().getTime();

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
};

function App(): JSX.Element {
  const [item, setItem] = useState<User | null>(null);
  const [cache, setCache] = useState<Record<number, User>>({});

  // Функция для получения случайного пользователя с использованием кэширования
  const receiveRandomUser = useCallback(async () => {
    try {
      const id = Math.floor(Math.random() * (10 - 1)) + 1;

      // Проверка наличия пользователя в кэше
      if (cache[id]) {
        setItem(cache[id]);
        return;
      }

      // Запрос к API для получения данных пользователя
      const response = await fetch(`${URL}/${id}`);
      if (!response.ok) throw new Error("Network response was not ok");

      const _user = (await response.json()) as User;
      
      // Обновление кэша и состояния с пользователем
      setCache((prevCache) => ({ ...prevCache, [id]: _user }));
      setItem(_user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  }, [cache]);

  // Обработчик клика с использованием хука useThrottle для ограничения частоты вызова
  const handleButtonClick = useThrottle(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      receiveRandomUser();
    },
    1000 // Задержка в миллисекундах для троттлинга
  );

  return (
    <div>
      <header>Get a Random User</header>
      <Button onClick={handleButtonClick} />
      <UserInfo user={item} />
    </div>
  );
}

export default App;

