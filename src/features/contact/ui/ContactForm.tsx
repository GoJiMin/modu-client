'use client';

import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {motion} from 'framer-motion';
import FormInputField from './FormInputField';
import SubmittedContactFormAnimation from './SubmittedContactFormAnimation';
import {contactFormSchema, ContactFormSchemaType, FORM_FIELDS, useSendSlackMessage} from '@/entities/contact';
import {AlertModal, Modal, useModal} from '@/shared/ui/modal';
import {Form} from '@/shared/shadcnComponent/ui/form';
import {Button} from '@/shared/shadcnComponent/ui/button';

export default function ContactForm() {
  const {openModal, handleModalOpen, handleModalClose} = useModal();
  const {isSubmitted, sendMessage, isPending} = useSendSlackMessage();

  const form = useForm<ContactFormSchemaType>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });
  const {reset, getValues} = form;

  // 취소버튼 눌렀을 시
  const handleCancel = () => {
    handleModalClose();
  };

  // 확인버튼 눌렀을 시
  const handleConfirm = async () => {
    const data = getValues();
    sendMessage(data);
    reset(); // 폼 초기화
    handleModalClose(); // 모달 닫기
  };

  const onValid = (data: ContactFormSchemaType) => {
    if (!data) return;
    handleModalOpen(); //모달 열기
  };

  return (
    <>
      <motion.div
        initial={{scale: 0.95, opacity: 0}}
        animate={{scale: 1, opacity: 1}}
        transition={{duration: 0.5}}
        className="bg-white w-full max-w-4xl p-6 md:p-16 flex items-start md:rounded-3xl md:shadow-xl relative overflow-hidden"
      >
        {isSubmitted && <SubmittedContactFormAnimation />}
        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(onValid)}
            key="form"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.5}}
            className="flex flex-col justify-between h-full space-y-6 w-full"
          >
            <motion.h2
              initial={{opacity: 0, y: -20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.1}}
              className="text-3xl md:text-4xl font-bold m-4 mb-6 md:mb-10 text-boldBlue text-center"
            >
              문의하기
            </motion.h2>
            {FORM_FIELDS.map(({name, label, placeholder, isTextarea}) => (
              <FormInputField
                key={name}
                control={form.control}
                name={name}
                label={label}
                placeholder={placeholder}
                isTextarea={isTextarea}
              />
            ))}
            <Button
              type="submit"
              className="bg-boldBlue !mt-8 md:!mt-20 text-white font-extrabold py-6 rounded-xl hover:bg-gray-700 transition"
              disabled={isPending}
              aria-label={isPending ? '전송 중 ...' : '전송'}
              aria-disabled={isPending}
            >
              {isPending ? '전송 중 ...' : '전송'}
            </Button>
          </motion.form>
        </Form>
      </motion.div>
      {openModal && (
        <Modal onClose={handleModalClose}>
          <AlertModal onCancel={handleCancel} onConfirm={handleConfirm} message={'전송을 완료하시겠습니까?'} />
        </Modal>
      )}
    </>
  );
}
