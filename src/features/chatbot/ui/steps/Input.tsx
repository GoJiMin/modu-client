import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useShallow} from 'zustand/react/shallow';
import {BotResponse, ChatBubble, Step, useChatStore} from '@/entities/ai-search';
import {Form, FormControl, FormField, FormItem} from '@/shared/shadcnComponent/ui/form';
import {Input as InputField} from '@/shared/shadcnComponent/ui/input';
import {LucideIcon} from '@/shared/ui/icons';

const FormSchema = z.object({
  keyword: z
    .string()
    .min(2, '두 글자 이상은 입력해 주셔야 찾아드릴 수 있어요! 😅')
    .max(20, '너무 길어요! 20자 이내로 줄여주세요.'),
});

type FormSchemaType = z.infer<typeof FormSchema>;

export default function Input() {
  const {setKeyword, setStep} = useChatStore(
    useShallow(state => ({
      setKeyword: state.setKeyword,
      setStep: state.setStep,
    })),
  );

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      keyword: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const {errors} = form.formState;

  const onSubmit = (formValues: FormSchemaType) => {
    setKeyword(formValues.keyword);
    setStep('search');
  };

  return (
    <Step>
      <div className="flex flex-col gap-4">
        <BotResponse>
          <ChatBubble>
            안녕하세요! <strong>모후봇</strong>이에요.
          </ChatBubble>
          <ChatBubble>궁금한 제품의 후기를 요약해 드릴게요.</ChatBubble>
        </BotResponse>

        {errors.keyword && (
          <BotResponse>
            <div className="bg-red-50 p-3 text-sm md:text-base rounded-lg rounded-tl-none shadow-sm border border-red-200 text-red-600">
              {errors.keyword.message}
            </div>
          </BotResponse>
        )}
      </div>
      <Form {...form}>
        <form className="w-full flex gap-2 mt-auto" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="keyword"
            render={({field}) => (
              <FormItem className="flex-1">
                <FormControl>
                  <InputField
                    className="border-gray-300 bg-white focus:border-mediumBlue px-4 py-3 rounded-xl border focus:outline-none transition-colors"
                    spellCheck="false"
                    autoComplete="off"
                    placeholder="예: 아이폰 17 프로, 성심당 튀김소보로"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <button
            type="submit"
            className="bg-mediumBlue text-white p-3 rounded-xl hover:bg-boldBlue disabled:bg-gray-300 transition-colors shrink-0"
          >
            <LucideIcon name="Search" className="w-6 h-6" />
          </button>
        </form>
      </Form>
    </Step>
  );
}
