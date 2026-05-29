import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLazyMeQuery } from '../store/api/authApi';
import { logout, setCredentials } from '../store/authSlice';
import { RootState } from '../store';

export const AuthBootstrap = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token) || localStorage.getItem('token');
  const [loadMe] = useLazyMeQuery();

  useEffect(() => {
    if (!token) return;

    // If local state already exists, still sync once to avoid stale role/studentId
    let isMounted = true;
    loadMe(undefined)
      .unwrap()
      .then((res: any) => {
        if (!isMounted || !res?.data) return;
        dispatch(
          setCredentials({
            token,
            user: {
              username: res.data.username,
              role: res.data.role,
              studentId: res.data.studentId ?? null,
              mustChangePassword: res.data.mustChangePassword
            },
          })
        );
      })
      .catch(() => {
        if (isMounted) {
          dispatch(logout());
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dispatch, loadMe, token]);

  return null;
};
