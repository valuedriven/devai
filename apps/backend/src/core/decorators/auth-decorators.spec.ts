/* eslint-disable @typescript-eslint/unbound-method */

import { ROLES_KEY, Roles } from './roles.decorator';
import { IS_PUBLIC_KEY, Public } from './public.decorator';

describe('@Roles decorator', () => {
  it('should set metadata with role names', () => {
    class TestController {
      @Roles('admin', 'manager')
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      ROLES_KEY,
      TestController.prototype.testMethod,
    );
    expect(metadata).toEqual(['admin', 'manager']);
  });

  it('should set metadata with single role', () => {
    class TestController {
      @Roles('admin')
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      ROLES_KEY,
      TestController.prototype.testMethod,
    );
    expect(metadata).toEqual(['admin']);
  });
});

describe('@Public decorator', () => {
  it('should set isPublic metadata to true', () => {
    class TestController {
      @Public()
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      IS_PUBLIC_KEY,
      TestController.prototype.testMethod,
    );
    expect(metadata).toBe(true);
  });
});
