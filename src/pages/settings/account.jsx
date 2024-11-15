import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import BreadcrumbComponent from '@/components/breadcrumb';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMainContext } from '@/context/main-context';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { auth, db } from '@/api/firebase';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from 'firebase/auth';

function Account() {
  const { teacherData, studentData } = useMainContext();
  const { toast } = useToast();

  const username = teacherData.email?.replace(/@student\.uz$/, '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      email: studentData?.email || '',
      fullName: studentData?.fullName || '',
      phoneNumber: studentData?.phoneNumber || '',
      parentPhoneNumber: studentData?.parentPhoneNumber || '',
      address: studentData?.address || '',
      telegram: studentData?.telegram || '',
      passportId: studentData?.passportId || '',
    },
  });

  useEffect(() => {
    if (studentData) {
      reset({
        email: studentData.email,
        fullName: studentData.fullName,
        phoneNumber: studentData.phoneNumber,
        parentPhoneNumber: studentData.parentPhoneNumber,
        address: studentData.address,
        telegram: studentData.telegram,
        passportId: studentData.passportId,
      });
    }
  }, [studentData, reset]);

  const onSubmit = async (data) => {
    try {
      const docRef = doc(db, 'students', studentData.id);

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        data.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updateDoc(docRef, {
        ...data,
        password: data.newPassword ? data.newPassword : data.currentPassword,
        email: data.email,
      });

      if (data.email !== studentData.email) {
        await updateEmail(auth.currentUser, data.email);
      }

      if (data.newPassword) {
        await updatePassword(auth.currentUser, data.newPassword);
      }

      toast({
        title: 'Account updated successfully',
      });
      reset();
    } catch (error) {
      toast({
        title: 'Error occurred',
        description: error.message,
        status: 'error',
      });
    }
  };

  return (
    <div className="px-4 lg:px-8 mx-auto my-4 space-y-4">
      <h1 className="text-2xl font-bold">Account</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  {...register('fullName', {
                    required: 'Full name is required',
                  })}
                />
                {errors.fullName && (
                  <p className="text-red-600">{errors.fullName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your address"
                  {...register('address')}
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">phoneNumber</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter your phoneNumber"
                  type="tel"
                  {...register('phoneNumber', {
                    required: 'phoneNumber is required',
                  })}
                />
                {errors.phoneNumber && (
                  <p className="text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="parentPhoneNumber">parentPhoneNumber</Label>
                <Input
                  id="parentPhoneNumber"
                  placeholder="Enter your parentPhoneNumber"
                  type="tel"
                  {...register('parentPhoneNumber', {
                    required: 'parentPhoneNumber is required',
                  })}
                />
                {errors.parentPhoneNumber && (
                  <p className="text-red-600">
                    {errors.parentPhoneNumber.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="passportId">passportId</Label>
                <Input
                  id="passportId"
                  placeholder="Enter your passportId"
                  {...register('passportId', {
                    required: 'passportId is required',
                  })}
                />
                {errors.passportId && (
                  <p className="text-red-600">{errors.passportId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telegram">telegram</Label>
                <Input
                  id="telegram"
                  placeholder="Enter your telegram"
                  {...register('telegram')}
                />
              </div>
            </div>
          </div>

          {/* Change Email and Password */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Change Email and Password</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Email"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && (
                  <p className="text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  placeholder="Enter your current password"
                  type="password"
                  {...register('currentPassword', {
                    required: 'Current passwordsiz accountni yangilay olmaysiz',
                  })}
                />
                {errors.currentPassword && (
                  <p className="text-red-600">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  placeholder="Enter your new password"
                  type="password"
                  {...register('newPassword', {
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                {errors.newPassword && (
                  <p className="text-red-600">{errors.newPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit">Submit</Button>
        </div>
      </form>
    </div>
  );
}

export default Account;
