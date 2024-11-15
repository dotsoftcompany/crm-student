import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMainContext } from '@/context/main-context';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export const description =
  "A login page with two columns. The first column has the login form with email and password. There's a Forgot your password link and a link to sign up if you do not have an account. The second column has a cover image.";

export const containerClassName = 'w-full h-full p-4 xl:p-0';

function Login() {
  const { signInUser } = useMainContext();
  const [data, setData] = useState({
    username: '',
    password: '',
  });
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const signIn = async () => {
    const email = `${data.username}@student.uz`;
    const password = data.password;

    if (!email || !password) {
      setError('Username yoki password kiritilmagan.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signInUser(email, password);
    } catch (err) {
      setError('Failed to log in. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full xl:grid xl:grid-cols-3 h-screen overflow-hidden">
      <div className="flex items-center justify-center h-screen xl:h-auto xl:py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label required htmlFor="username">
                Username
              </Label>
              <div className="relative">
                <Input
                  className="peer pe-12 pr-24"
                  type="text"
                  id="username"
                  required
                  value={data.username}
                  onChange={handleChange}
                  name="username"
                  placeholder="johndoe"
                />
                <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm bg-background my-0.5 mr-0.5 rounded-r-md text-muted-foreground peer-disabled:opacity-50">
                  @student.uz
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label required htmlFor="password">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={isVisible ? 'text' : 'password'}
                  required
                  value={data.password}
                  onChange={handleChange}
                  name="password"
                  placeholder="***********"
                />
                <button
                  className="absolute inset-y-px end-px flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 transition-shadow hover:text-foreground focus-visible:border focus-visible:border-ring focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <Eye size={16} strokeWidth={2} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            {error && <small className="text-red-500">{error}</small>}
            <Button className="w-full" onClick={signIn} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted xl:block col-span-2">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/crm-system-4fefe.appspot.com/o/cover%2Fcrm-cover.png?alt=media&token=611e8787-6118-454e-aa02-1372d844fe7e"
          alt="Image"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

export default Login;
