import { ROLES_KEY, Roles } from './roles.decorator';
import { IS_PUBLIC_KEY, Public } from './public.decorator';

function getMethodKey(proto: object, method: string) {
  return proto[method as keyof typeof proto];
}

describe('@Roles decorator', () => {
  it('should set metadata with role names', () => {
    // Arrange
    class TestController {
      @Roles('admin', 'manager')
      testMethod() {}
    }

    const metadata: string[] = Reflect.getMetadata(
      ROLES_KEY,
      getMethodKey(TestController.prototype, 'testMethod'),
    ) as string[];
    // Assert
    expect(metadata).toEqual(['admin', 'manager']);
  });

  it('should set metadata with single role', () => {
    // Arrange
    class TestController {
      @Roles('admin')
      testMethod() {}
    }

    const metadata: string[] = Reflect.getMetadata(
      ROLES_KEY,
      getMethodKey(TestController.prototype, 'testMethod'),
    ) as string[];
    // Assert
    expect(metadata).toEqual(['admin']);
  });
});

describe('@Public decorator', () => {
  it('should set isPublic metadata to true', () => {
    // Arrange
    class TestController {
      @Public()
      testMethod() {}
    }

    const metadata: boolean = Reflect.getMetadata(
      IS_PUBLIC_KEY,
      getMethodKey(TestController.prototype, 'testMethod'),
    ) as boolean;
    // Assert
    expect(metadata).toBe(true);
  });
});
