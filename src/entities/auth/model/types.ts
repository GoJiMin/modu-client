import {SearchLimitState} from '@/entities/ai-search';

type LoggedInUser = {
  isLoggedIn: true;
  userNickname: string;
  userEmail: string;
};

type LoggedOutUser = {
  isLoggedIn: false;
  userNickname: null;
  userEmail: null;
};

export type User = LoggedInUser | LoggedOutUser;

export type Session = User & {
  searchLimit: SearchLimitState;
};
